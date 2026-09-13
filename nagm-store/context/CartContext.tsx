"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CartItem, Product, Coupon } from "@/types";
import { coupons } from "@/data/coupons";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shipping: number;
  vat: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const activeUid = user ? user.uid : "guest";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const isLoadedForUidRef = useRef<string | null>(null);
  const { showToast } = useToast();

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
    try {
      localStorage.removeItem(`negm_cart_${activeUid}`);
      localStorage.removeItem(`negm_coupon_${activeUid}`);
    } catch (e) {
      console.error("Failed to clear cart in localStorage", e);
    }
  }, [activeUid]);

  const applyCoupon = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      const foundCoupon = coupons.find((c) => c.code === cleanCode);
      
      if (!foundCoupon) {
        return { success: false, message: "Invalid coupon code. Try NEGM10 or WELCOME15" };
      }

      const currentSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
    [cart, showToast]
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
