"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CartItem, Product, Coupon } from "@/types";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import {
  subscribePromotions,
  DEFAULT_PROMOTIONS,
  PromotionsConfig,
  getCouponsWithPromotions,
} from "@/lib/promotions";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shipping: number;
  vat: number;
  total: number;
  itemCount: number;
  promotions: PromotionsConfig;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const activeUid = user ? user.uid : "guest";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [promotions, setPromotions] = useState<PromotionsConfig>(DEFAULT_PROMOTIONS);
  const isLoadedForUidRef = useRef<string | null>(null);
  const { showToast } = useToast();

  // Memory cache of order history status by UID to avoid duplicate reads during a session
  const orderHistoryCacheRef = useRef<Map<string, boolean>>(new Map());

  // Check whether a customer has placed any previous order in Firestore orders collection
  const checkUserHasOrders = useCallback(
    async (uid: string): Promise<{ hasOrders: boolean; error?: string }> => {
      if (orderHistoryCacheRef.current.has(uid)) {
        return { hasOrders: orderHistoryCacheRef.current.get(uid)! };
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", uid),
          limit(1)
        );
        const snap = await getDocs(q);
        const hasOrders = !snap.empty;
        orderHistoryCacheRef.current.set(uid, hasOrders);
        return { hasOrders };
      } catch (err: any) {
        console.error("Failed to query customer orders:", err);
        return {
          hasOrders: false,
          error: err?.message || "Failed to verify customer order history",
        };
      }
    },
    []
  );

  // Subscribe to real-time promotional discounts from Firestore
  useEffect(() => {
    const unsubscribe = subscribePromotions((latestPromotions) => {
      setPromotions(latestPromotions);
    });
    return () => unsubscribe();
  }, []);

  // Compute active coupon definitions merged with current promotional percentages
  const activeCoupons = useMemo(() => {
    return getCouponsWithPromotions(promotions);
  }, [promotions]);

  // Synchronize active applied coupon whenever promotions or user state update
  useEffect(() => {
    if (!coupon) return;
    const matched = activeCoupons.find((c) => c.code === coupon.code);
    if (!matched) {
      setCoupon(null);
      return;
    }

    // If ESKM (new customer coupon) is active, ensure user is still logged in and has zero orders
    if (coupon.code === "ESKM" || matched.newCustomerOnly) {
      if (!user) {
        setCoupon(null);
        return;
      }
      checkUserHasOrders(user.uid).then(({ hasOrders }) => {
        if (hasOrders) {
          setCoupon(null);
        }
      });
    }

    if (
      matched.value !== coupon.value ||
      matched.minSubtotal !== coupon.minSubtotal ||
      matched.description !== coupon.description
    ) {
      setCoupon(matched);
    }
  }, [activeCoupons, checkUserHasOrders, coupon, user]);

  // Synchronize cart with current authenticated user (or guest)
  useEffect(() => {
    if (authLoading) return;

    const cartKey = `negm_cart_${activeUid}`;
    const couponKey = `negm_coupon_${activeUid}`;

    try {
      // One-time legacy cleanup/migration for guest only
      if (activeUid === "guest" && !localStorage.getItem(cartKey) && localStorage.getItem("negm_cart")) {
        const legacyCart = localStorage.getItem("negm_cart");
        if (legacyCart) localStorage.setItem(cartKey, legacyCart);
      }
      if (localStorage.getItem("negm_cart")) {
        localStorage.removeItem("negm_cart");
      }
      if (localStorage.getItem("negm_coupon")) {
        localStorage.removeItem("negm_coupon");
      }

      const savedCart = localStorage.getItem(cartKey);
      const savedCoupon = localStorage.getItem(couponKey);

      setCart(savedCart ? JSON.parse(savedCart) : []);
      setCoupon(savedCoupon ? JSON.parse(savedCoupon) : null);
    } catch (e) {
      console.error("Failed to load cart from localStorage for", activeUid, e);
      setCart([]);
      setCoupon(null);
    }

    isLoadedForUidRef.current = activeUid;
  }, [activeUid, authLoading]);

  // Persist cart strictly for the loaded UID
  useEffect(() => {
    if (authLoading || isLoadedForUidRef.current !== activeUid) {
      return;
    }

    const cartKey = `negm_cart_${activeUid}`;
    const couponKey = `negm_coupon_${activeUid}`;

    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      if (coupon) {
        localStorage.setItem(couponKey, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(couponKey);
      }
    } catch (e) {
      console.error("Failed to save cart to localStorage for", activeUid, e);
    }
  }, [cart, coupon, activeUid, authLoading]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          const updated = [...prevCart];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty > product.stockCount ? product.stockCount : newQty,
          };
          return updated;
        } else {
          return [...prevCart, { product, quantity: Math.min(quantity, product.stockCount) }];
        }
      });
      showToast(`Added "${product.name.slice(0, 30)}..." to Cart!`, "success");
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
      showToast("Item removed from cart.", "info");
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.product.id === productId) {
            const validQty = Math.min(quantity, item.product.stockCount);
            return { ...item, quantity: validQty };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
    if (activeUid !== "guest") {
      orderHistoryCacheRef.current.set(activeUid, true);
    }
    try {
      localStorage.removeItem(`negm_cart_${activeUid}`);
      localStorage.removeItem(`negm_coupon_${activeUid}`);
    } catch (e) {
      console.error("Failed to clear cart in localStorage", e);
    }
  }, [activeUid]);

  const applyCoupon = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      const cleanCode = code.trim().toUpperCase();
      const foundCoupon = activeCoupons.find((c) => c.code === cleanCode);
      
      if (!foundCoupon) {
        return { success: false, message: "Invalid coupon code. Try GNSYR or ESKM" };
      }

      const currentSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      // ESKM: Exclusive New Customer Coupon
      if (foundCoupon.code === "ESKM" || foundCoupon.newCustomerOnly) {
        if (authLoading) {
          return {
            success: false,
            message: "Verifying customer account, please try again in a moment.",
          };
        }

        if (!user) {
          return {
            success: false,
            message: "Coupon ESKM is exclusively for new customers. Please log in or sign up to verify your first-order eligibility.",
          };
        }

        const { hasOrders, error } = await checkUserHasOrders(user.uid);
        if (error) {
          return {
            success: false,
            message: "Unable to verify first-order eligibility at this time. Please try again.",
          };
        }

        if (hasOrders) {
          return {
            success: false,
            message: "Coupon ESKM is only valid for new customers on their first order.",
          };
        }
      }

      if (currentSubtotal < foundCoupon.minSubtotal) {
        return { 
          success: false, 
          message: `Coupon requires minimum subtotal of ${foundCoupon.minSubtotal} EGP` 
        };
      }

      setCoupon(foundCoupon);
      showToast(`Coupon "${foundCoupon.code}" applied successfully!`, "success");
      return { success: true, message: `Coupon applied: ${foundCoupon.description}` };
    },
    [activeCoupons, authLoading, cart, checkUserHasOrders, showToast, user]
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    showToast("Coupon removed.", "info");
  }, [showToast]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );
  
  const discountAmount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
    if (coupon.discountType === "percentage") {
      return (subtotal * coupon.value) / 100;
    }
    return coupon.value;
  }, [coupon, subtotal]);

  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  // Free shipping over 2000 EGP subtotal, else 50 EGP shipping inside Egypt
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 50;

  // 14% Egyptian VAT
  const vat = Math.round(amountAfterDiscount * 0.14);

  const total = Math.round(amountAfterDiscount + shipping + vat);
  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      coupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      discountAmount,
      shipping,
      vat,
      total,
      itemCount,
      promotions,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      coupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      discountAmount,
      shipping,
      vat,
      total,
      itemCount,
      promotions,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
