"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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

  const addToCart = (product: Product, quantity = 1) => {
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
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    showToast("Item removed from cart.", "info");
  };

  const updateQuantity = (productId: string, quantity: number) => {
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
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    try {
      localStorage.removeItem(`negm_cart_${activeUid}`);
      localStorage.removeItem(`negm_coupon_${activeUid}`);
    } catch (e) {
      console.error("Failed to clear cart in localStorage", e);
    }
  };

  const applyCoupon = (code: string) => {
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
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast("Coupon removed.", "info");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }
  }

  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  // Free shipping over 2000 EGP subtotal, else 50 EGP shipping inside Egypt
  const shipping = subtotal > 2000 || subtotal === 0 ? 0 : 50;

  // 14% Egyptian VAT
  const vat = Math.round(amountAfterDiscount * 0.14);

  const total = Math.round(amountAfterDiscount + shipping + vat);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
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
