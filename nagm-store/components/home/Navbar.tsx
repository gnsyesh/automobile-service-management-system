"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  Car,
  ChevronDown,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useVehicle } from "@/context/VehicleContext";
import VehicleSelectorModal from "@/components/common/VehicleSelectorModal";
import { products } from "@/data/products";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop Parts", href: "/shop" },
  { name: "Engine Oils", href: "/shop?category=engine-oils" },
  { name: "Brake System", href: "/shop?category=brake-system" },
  { name: "Filters", href: "/shop?category=filters" },
  { name: "Wishlist", href: "/wishlist" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { selectedVehicle, setIsVehicleModalOpen } = useVehicle();

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

        <div className="border-b border-[#2D2D2D] bg-[#111111]/90 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A2E] to-[#5c271e] text-xl font-black text-white shadow-lg border border-[#D4A017]/30">
                N
              </div>
              <div className="leading-none">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  NEGM<span className="ml-1 text-[#D4A017]">STORE</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mt-0.5">
                  LUXURY AUTO PARTS
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:block">
              <ul className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="relative text-sm font-semibold text-gray-300 transition-all duration-300 hover:text-[#D4A017] py-2 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#D4A017] after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Vehicle Selector Pill Trigger */}
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-xl border border-[#D4A017]/40 bg-[#1B1B1B]/90 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:border-[#D4A017] hover:bg-[#8B3A2E]/20 shadow-md"
            >
              <Car className="h-4 w-4 text-[#D4A017]" />
              <span className="max-w-[160px] truncate">
                {selectedVehicle
                  ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                  : "Select My Vehicle"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
                className="relative p-2.5 rounded-xl bg-[#1B1B1B] text-gray-300 hover:text-[#D4A017] hover:bg-[#252525] transition"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-xl bg-[#1B1B1B] text-gray-300 hover:text-red-400 hover:bg-[#252525] transition"
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
                className="relative p-2.5 rounded-xl bg-[#1B1B1B] text-gray-300 hover:text-[#D4A017] hover:bg-[#252525] transition"
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
                className="hidden sm:flex p-2.5 rounded-xl bg-[#1B1B1B] text-gray-300 hover:text-[#D4A017] hover:bg-[#252525] transition"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-[#1B1B1B] text-white xl:hidden"
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
              className="border-b border-[#D4A017]/30 bg-[#111111]/98 p-4 backdrop-blur-2xl shadow-2xl"
            >
              <div className="mx-auto max-w-4xl">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-[#D4A017]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by part name, SKU (e.g. NS-OIL-001), brand (Mobil, Bosch)..."
                    className="w-full rounded-2xl border border-[#2D2D2D] bg-[#1B1B1B] py-3.5 pl-12 pr-24 text-sm text-white placeholder-gray-400 focus:border-[#D4A017] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 rounded-xl bg-[#8B3A2E] px-4 py-2 text-xs font-bold text-white hover:bg-[#a34436] transition"
                  >
                    Search
                  </button>
                </form>

                {/* Auto-complete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-3 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] p-2 space-y-1 shadow-2xl">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#252525] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 bg-[#111111] rounded-md overflow-hidden">
                            <Image src={item.images[0]} alt="" fill className="object-contain p-1" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white line-clamp-1">{item.name}</div>
                            <div className="text-[11px] text-[#D4A017]">{item.brand} • {item.sku}</div>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-white">
                          {item.price.toLocaleString()} EGP
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
              className="border-b border-[#2D2D2D] bg-[#111111]/98 backdrop-blur-2xl xl:hidden overflow-hidden"
            >
              <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsVehicleModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#D4A017]/40 bg-[#1B1B1B] text-sm font-bold text-white"
                >
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-[#D4A017]" />
                    <span>{selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : "Select My Vehicle"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <nav>
                  <ul className="space-y-1">
                    {navLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-200 hover:bg-[#8B3A2E]/20 hover:text-[#D4A017] transition"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="pt-4 border-t border-[#2D2D2D] flex items-center justify-around">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-[#D4A017]"
                  >
                    <User className="h-5 w-5" /> Account Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal />
    </>
  );
}