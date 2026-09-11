"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/types";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const activeUid = user ? user.uid : "guest";

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const isLoadedForUidRef = useRef<string | null>(null);
  const { showToast } = useToast();

  // Synchronize wishlist with current authenticated user (or guest)
  useEffect(() => {
    if (authLoading) return;

    const wishlistKey = `negm_wishlist_${activeUid}`;

    try {
      // One-time legacy cleanup/migration for guest only
      if (activeUid === "guest" && !localStorage.getItem(wishlistKey) && localStorage.getItem("negm_wishlist")) {
        const legacyWishlist = localStorage.getItem("negm_wishlist");
        if (legacyWishlist) localStorage.setItem(wishlistKey, legacyWishlist);
      }
      if (localStorage.getItem("negm_wishlist")) {
        localStorage.removeItem("negm_wishlist");
      }

      const saved = localStorage.getItem(wishlistKey);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error("Failed to load wishlist from localStorage for", activeUid, e);
      setWishlist([]);
    }

    isLoadedForUidRef.current = activeUid;
  }, [activeUid, authLoading]);

  // Persist wishlist strictly for the loaded UID
  useEffect(() => {
    if (authLoading || isLoadedForUidRef.current !== activeUid) {
      return;
    }

    const wishlistKey = `negm_wishlist_${activeUid}`;

    try {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage for", activeUid, e);
    }
  }, [wishlist, activeUid, authLoading]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      setWishlist((prev) => [...prev, product]);
      showToast(`Saved "${product.name.slice(0, 30)}..." to Wishlist!`, "success");
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    showToast("Removed from Wishlist.", "info");
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    try {
      localStorage.removeItem(`negm_wishlist_${activeUid}`);
    } catch (e) {
      console.error("Failed to clear wishlist in localStorage", e);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
