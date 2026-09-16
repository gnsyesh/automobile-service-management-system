import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { verifyFirebaseToken } from "@/lib/server-auth";
import { recordOrderSalesServer } from "@/lib/server-sales";
import { Order, CartItem } from "@/types";

const DEFAULT_GNSYR_PERCENTAGE = 10;
const DEFAULT_ESKM_PERCENTAGE = 15;
const ESKM_MIN_SUBTOTAL = 1000;
const ONLINE_ORDER_EXPIRATION_MINUTES = 30;

type CartRequestItem = {
  productId: string;
  quantity: number;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
};

function clampPercentage(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
      ? Number(value)
      : NaN;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, parsed));
}

function generateOrderId(): string {
  const year = new Date().getFullYear();
  const timeComponent = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NS-${year}-${timeComponent}-${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    // 1. Verify the Firebase user token
    const decodedToken = await verifyFirebaseToken(request);
    const uid = decodedToken.uid;

    // 2. Fetch user profile from Firebase Auth to verify email status
    const userRecord = await adminAuth.getUser(uid);
    const isGoogleUser = userRecord.providerData.some(
      (p: { providerId: string }) => p.providerId === "google.com"
    );

    if (!userRecord.emailVerified && !isGoogleUser) {
      return NextResponse.json(
        {
          error: "Please verify your email address before placing an order.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    const customerEmail = userRecord.email || decodedToken.email || "";

    // 3. Parse and validate request body
    const body = await request.json();
    const {
      items,
      couponCode,
      shippingAddress,
      paymentMethod,
      notes,
    }: {
      items?: CartRequestItem[];
      couponCode?: string | null;
      shippingAddress?: ShippingAddress;
      paymentMethod?: "cod" | "card" | "wallet";
      notes?: string;
    } = body;

    // Validate cart items presence
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty", code: "EMPTY_CART" },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.governorate?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.street?.trim() ||
      !shippingAddress.building?.trim()
    ) {
      return NextResponse.json(
        { error: "Shipping address is incomplete", code: "INVALID_SHIPPING_ADDRESS" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (
      paymentMethod !== "cod" &&
      paymentMethod !== "card" &&
      paymentMethod !== "wallet"
    ) {
      return NextResponse.json(
        { error: "Invalid payment method", code: "INVALID_PAYMENT_METHOD" },
        { status: 400 }
      );
    }

    // Validate individual cart item fields
    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        !item.productId.trim() ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid cart item", code: "INVALID_CART_ITEM" },
          { status: 400 }
        );
      }
    }

    // Prevent duplicate product entries in cart
    const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId)));
    if (uniqueProductIds.length !== items.length) {
      return NextResponse.json(
        { error: "Duplicate products in cart are not allowed", code: "DUPLICATE_ITEMS" },
        { status: 400 }
      );
    }

    // 4. Fetch store discount percentages for coupon validation
    const discountsSnapshot = await adminDb
      .collection("storeSettings")
      .doc("discounts")
      .get();

    let gnsyrPercentage = DEFAULT_GNSYR_PERCENTAGE;
    let eskmPercentage = DEFAULT_ESKM_PERCENTAGE;

    if (discountsSnapshot.exists) {
      const data = discountsSnapshot.data();
      gnsyrPercentage = clampPercentage(
        data?.gnsyr?.percentage ?? data?.negm10?.percentage,
        DEFAULT_GNSYR_PERCENTAGE
      );
      eskmPercentage = clampPercentage(
        data?.eskm?.percentage ?? data?.welcome15?.percentage,
        DEFAULT_ESKM_PERCENTAGE
      );
    }

    const cleanCouponCode =
      typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";

    // If ESKM is requested, verify the user has 0 previous orders
    if (cleanCouponCode === "ESKM") {
      const existingOrders = await adminDb
        .collection("orders")
        .where("userId", "==", uid)
        .limit(1)
        .get();

      if (!existingOrders.empty) {
        return NextResponse.json(
          {
            error: "Coupon ESKM is only valid for a customer's first order",
            code: "COUPON_NEW_CUSTOMERS_ONLY",
          },
          { status: 400 }
        );
      }
    } else if (cleanCouponCode && cleanCouponCode !== "GNSYR") {
      return NextResponse.json(
        { error: "Invalid coupon code", code: "INVALID_COUPON" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const nowIso = new Date().toISOString();
    const expiresAt =
      paymentMethod !== "cod"
        ? new Date(
            Date.now() + ONLINE_ORDER_EXPIRATION_MINUTES * 60 * 1000
          ).toISOString()
        : undefined;

    // 5. Execute atomic Firestore Transaction:
    // - Reads product documents
    // - Validates sufficient stock
    // - Decrements stock atomically (solving the concurrency/race condition)
    // - Creates the order document
    const createdOrder = await adminDb.runTransaction(async (transaction) => {
      // A. Read all products
      const productDocRefs = uniqueProductIds.map((pid) =>
        adminDb.collection("products").doc(pid)
      );
      const productDocs = await transaction.getAll(...productDocRefs);

      const productsMap = new Map<string, Record<string, any>>();
      productDocs.forEach((docSnap) => {
        if (docSnap.exists) {
          productsMap.set(docSnap.id, docSnap.data()!);
        }
      });

      // Ensure every requested product exists
      for (const reqItem of items) {
        if (!productsMap.has(reqItem.productId)) {
          throw new Error(`PRODUCT_NOT_FOUND:${reqItem.productId}`);
        }
      }

      // B. Validate stock and build trusted items list
      const trustedItems: CartItem[] = [];
      let subtotal = 0;

      for (const reqItem of items) {
        const productData = productsMap.get(reqItem.productId)!;
        const price = Number(productData.price);
        const stockCount = Number(productData.stockCount);

        if (!Number.isFinite(price) || price < 0) {
          throw new Error(`INVALID_PRICE:${reqItem.productId}`);
        }
        if (!Number.isFinite(stockCount) || stockCount < 0) {
          throw new Error(`INVALID_STOCK:${reqItem.productId}`);
        }

        if (productData.inStock === false || stockCount <= 0) {
          throw new Error(
            `OUT_OF_STOCK:${productData.name || reqItem.productId}`
          );
        }

        if (reqItem.quantity > stockCount) {
          throw new Error(
            `INSUFFICIENT_STOCK:${productData.name || reqItem.productId}:${stockCount}`
          );
        }

        subtotal += price * reqItem.quantity;

        // Decrement product stock inside transaction
        const newStockCount = stockCount - reqItem.quantity;
        const productRef = adminDb.collection("products").doc(reqItem.productId);
        transaction.update(productRef, {
          stockCount: newStockCount,
          inStock: newStockCount > 0,
          updatedAt: nowIso,
        });

        trustedItems.push({
          product: {
            id: reqItem.productId,
            sku: productData.sku ?? "",
            name: productData.name ?? "",
            brand: productData.brand ?? "",
            category: productData.category ?? "",
            subcategory: productData.subcategory ?? "",
            price,
            oldPrice: productData.oldPrice,
            discount: productData.discount,
            rating: productData.rating ?? 0,
            reviewsCount: productData.reviewsCount ?? 0,
            inStock: newStockCount > 0,
            stockCount: newStockCount,
            isFeatured: productData.isFeatured,
            isBestSeller: productData.isBestSeller,
            isOffer: productData.isOffer,
            images: Array.isArray(productData.images) ? productData.images : [],
            shortDescription: productData.shortDescription ?? "",
            description: productData.description ?? "",
            specifications: Array.isArray(productData.specifications)
              ? productData.specifications
              : [],
            features: Array.isArray(productData.features)
              ? productData.features
              : [],
            compatibility: productData.compatibility,
            weight: productData.weight,
            packageSize: productData.packageSize,
            relatedProductIds: productData.relatedProductIds,
            frequentlyBoughtTogetherIds: productData.frequentlyBoughtTogetherIds,
          },
          quantity: reqItem.quantity,
        });
      }

      // C. Calculate discounts
      let discountAmount = 0;
      let appliedCoupon: string | null = null;

      if (cleanCouponCode === "GNSYR") {
        discountAmount = (subtotal * gnsyrPercentage) / 100;
        appliedCoupon = "GNSYR";
      } else if (cleanCouponCode === "ESKM") {
        if (subtotal < ESKM_MIN_SUBTOTAL) {
          throw new Error(`MIN_SUBTOTAL_ESKM:${ESKM_MIN_SUBTOTAL}`);
        }
        discountAmount = (subtotal * eskmPercentage) / 100;
        appliedCoupon = "ESKM";
      }

      discountAmount = Math.max(0, Math.min(subtotal, discountAmount));
      const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
      const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 50;
      const vat = Math.round(amountAfterDiscount * 0.14);
      const total = Math.round(amountAfterDiscount + shipping + vat);

      // D. Build Order document
      const newOrder: Order = {
        id: orderId,
        userId: uid,
        userEmail: customerEmail,
        customerDetails: {
          fullName: shippingAddress.fullName.trim(),
          email: customerEmail,
          phone: shippingAddress.phone.trim(),
        },
        orderDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: trustedItems,
        subtotal,
        shipping,
        vat,
        discount: discountAmount,
        total,
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          governorate: shippingAddress.governorate.trim(),
          city: shippingAddress.city.trim(),
          street: shippingAddress.street.trim(),
          building: shippingAddress.building.trim(),
          apartment: shippingAddress.apartment?.trim() || notes?.trim() || "",
        },
        paymentMethod,
        paymentStatus: "pending",
        // COD orders start in Processing; online payments start in Pending until webhook confirms payment
        status: paymentMethod === "cod" ? "Processing" : "Pending",
        orderStatus: paymentMethod === "cod" ? "Processing" : "Pending",
        estimatedDelivery: "3-5 Business Days",
        trackingNumber: `EG-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        couponCode: appliedCoupon,
        notes: notes?.trim() || undefined,
        stockDecremented: true,
        salesRecorded: paymentMethod === "cod",
        expiresAt,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const orderRef = adminDb.collection("orders").doc(orderId);
      transaction.set(orderRef, newOrder);

      return newOrder;
    });

    // 6. For COD: record sales aggregation server-side (only after successful transaction)
    if (createdOrder.paymentMethod === "cod") {
      try {
        await recordOrderSalesServer(createdOrder);
      } catch (salesErr) {
        console.warn("Could not record sales aggregation for COD order:", salesErr);
      }
    }

    // 7. Return trusted order info and pricing
    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      pricing: {
        subtotal: createdOrder.subtotal,
        discountAmount: createdOrder.discount || 0,
        shipping: createdOrder.shipping,
        vat: createdOrder.vat,
        total: createdOrder.total,
      },
      paymentMethod: createdOrder.paymentMethod,
      paymentStatus: createdOrder.paymentStatus,
      orderStatus: createdOrder.orderStatus,
    });
  } catch (error: any) {
    console.error("Prepare order error:", error);

    const msg = error?.message || "";

    if (msg.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json(
        { error: "One or more products are no longer available", code: "PRODUCT_NOT_FOUND" },
        { status: 409 }
      );
    }

    if (msg.startsWith("OUT_OF_STOCK:")) {
      const prodName = msg.split(":")[1];
      return NextResponse.json(
        { error: `${prodName} is currently out of stock`, code: "OUT_OF_STOCK" },
        { status: 409 }
      );
    }

    if (msg.startsWith("INSUFFICIENT_STOCK:")) {
      const [, prodName, avail] = msg.split(":");
      return NextResponse.json(
        {
          error: `Insufficient stock for ${prodName}. Only ${avail} available.`,
          code: "INSUFFICIENT_STOCK",
          available: Number(avail),
        },
        { status: 409 }
      );
    }

    if (msg.startsWith("MIN_SUBTOTAL_ESKM:")) {
      return NextResponse.json(
        {
          error: "Coupon ESKM requires a minimum subtotal of 1000 EGP",
          code: "MIN_SUBTOTAL_NOT_MET",
        },
        { status: 400 }
      );
    }

    if (msg === "Missing authorization token") {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to prepare order. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}