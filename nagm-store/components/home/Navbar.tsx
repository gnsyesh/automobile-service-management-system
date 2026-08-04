"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Globe,
  Check
} from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage, languages } from "@/context/LanguageContext";
import { products } from "@/data/products";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.shop"), href: "/shop" },
    { name: t("nav.oils"), href: "/shop?category=engine-oils" },
    { name: t("nav.brakes"), href: "/shop?category=brake-system" },
    { name: t("nav.filters"), href: "/shop?category=filters" },
    { name: t("nav.wishlist"), href: "/wishlist" },
  ];

  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full transition-all duration-300">
        <AnnouncementBar />

        <div className="border-b border-slate-200 dark:border-[#2D2D2D] bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl shadow-md transition-colors duration-300">
          <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 gap-6">

            {/* Combined Official Icon + Styled HTML Text Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#1B1B1B] p-1 border border-[#D4A017]/40 shadow-md">
                <Image
                  src="/images/negm-store-logo.png"
                  alt="Negm Store Official Icon"
                  fill
                  priority
                  className="object-contain p-0.5"
                />
              </div>
              <div className="leading-none text-left rtl:text-right">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  NEGM<span className="ml-1 text-[#D4A017]">STORE</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 dark:text-gray-400 mt-0.5 font-semibold">
                  {t("nav.tagline")}
                </p>
              </div>
            </Link>

            {/* Centered Desktop Navigation */}
            <nav className="hidden xl:flex items-center justify-center flex-1 mx-6">
              <ul className="flex items-center gap-9">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="relative text-sm font-bold text-slate-700 dark:text-gray-200 transition-all duration-300 hover:text-[#D4A017] dark:hover:text-[#D4A017] py-2 after:absolute after:left-0 after:bottom-0 after:h-[2.5px] after:w-0 after:bg-[#D4A017] after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Aligned Action Icons & Language Selector */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Premium Language Selector */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Sun/Moon Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-300 hover:text-[#D4A017] hover:bg-slate-200 dark:hover:bg-[#252525] transition-all border border-slate-200 dark:border-white/10"
              >
                {mounted && isDarkMode ? (
                  <Sun className="h-5 w-5 text-[#D4A017] transition-transform rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600 dark:text-[#D4A017] transition-transform rotate-0 hover:-rotate-12" />
                )}
              </button>

              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-300 hover:text-[#D4A017] hover:bg-slate-200 dark:hover:bg-[#252525] transition"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-300 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-[#252525] transition"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-300 hover:text-[#D4A017] hover:bg-slate-200 dark:hover:bg-[#252525] transition"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B3A2E] text-[10px] font-black text-white shadow border border-[#D4A017]"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User Account Link */}
              <Link
                href="/profile"
                className="hidden sm:flex p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-700 dark:text-gray-300 hover:text-[#D4A017] hover:bg-slate-200 dark:hover:bg-[#252525] transition"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1B1B1B] text-slate-800 dark:text-white xl:hidden"
                aria-label="Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Drawer */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-slate-200 dark:border-[#D4A017]/30 bg-white/98 dark:bg-[#111111]/98 p-4 backdrop-blur-2xl shadow-2xl"
            >
              <div className="mx-auto max-w-4xl">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="absolute left-4 rtl:left-auto rtl:right-4 h-5 w-5 text-[#D4A017]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    className="w-full rounded-2xl border border-slate-300 dark:border-[#2D2D2D] bg-slate-100 dark:bg-[#1B1B1B] py-3.5 pl-12 pr-24 rtl:pl-24 rtl:pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:border-[#D4A017] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 rtl:right-auto rtl:left-3 rounded-xl bg-[#8B3A2E] px-4 py-2 text-xs font-bold text-white hover:bg-[#a34436] transition"
                  >
                    {t("nav.search")}
                  </button>
                </form>

                {/* Auto-complete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-2 space-y-1 shadow-2xl">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252525] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 bg-slate-100 dark:bg-[#111111] rounded-md overflow-hidden">
                            <Image src={item.images[0]} alt="" fill className="object-contain p-1" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                            <div className="text-[11px] text-[#D4A017]">{item.brand} • {item.sku}</div>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {item.price.toLocaleString()} {t("card.egp")}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-slate-200 dark:border-[#2D2D2D] bg-white/98 dark:bg-[#111111]/98 backdrop-blur-2xl xl:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-[1800px] px-6 py-6 space-y-4">

                {/* Mobile Language Selector Pill */}
                <div className="p-3.5 rounded-xl border border-slate-300 dark:border-[#D4A017]/40 bg-slate-100 dark:bg-[#1B1B1B]">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200 dark:border-[#2D2D2D]">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Globe className="h-4 w-4 text-[#D4A017]" />
                      <span>Language / اللغة</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? "bg-[#8B3A2E] text-white shadow"
                              : "bg-white dark:bg-[#111111] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-[#2D2D2D]"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#D4A017]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Theme Switch Button */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-300 dark:border-[#D4A017]/40 bg-slate-100 dark:bg-[#1B1B1B] text-sm font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Sun className="h-5 w-5 text-[#D4A017]" /> : <Moon className="h-5 w-5 text-indigo-600" />}
                    <span>Switch to {isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                  </div>
                </button>

                <nav>
                  <ul className="space-y-1">
                    {navLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-800 dark:text-gray-200 hover:bg-[#8B3A2E]/20 hover:text-[#D4A017] transition"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="pt-4 border-t border-slate-200 dark:border-[#2D2D2D] flex items-center justify-around">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:text-[#D4A017]"
                  >
                    <User className="h-5 w-5" /> {t("nav.profile")}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}