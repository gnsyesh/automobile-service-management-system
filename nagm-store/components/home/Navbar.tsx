"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Brands", href: "/brands" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-[#2D2D2D] bg-[#111111]/90 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* ================= Logo ================= */}

        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B3A2E] text-lg font-bold text-white shadow-lg">
            N
          </div>

          <div className="leading-none">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Negm
              <span className="ml-1 text-[#D4A017]">
                Store
              </span>
            </h1>

            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
              Auto Parts
            </p>
          </div>
        </Link>

        {/* ================= Desktop Navigation ================= */}

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="
                  relative
                  text-[15px]
                  font-medium
                  text-gray-200
                  transition-all
                  duration-300
                  hover:text-[#D4A017]

                  after:absolute
                  after:left-0
                  after:-bottom-2
                  after:h-[2px]
                  after:w-0
                  after:bg-[#D4A017]
                  after:transition-all
                  after:duration-300

                  hover:after:w-full
                  "
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ================= Right Side ================= */}

        <div className="flex items-center gap-5">

          <div className="hidden lg:flex items-center gap-5">

            <button className="text-gray-300 transition hover:text-[#D4A017]">
              <Search size={22} />
            </button>

            <button className="text-gray-300 transition hover:text-[#D4A017]">
              <ShoppingCart size={22} />
            </button>

            <button className="text-gray-300 transition hover:text-[#D4A017]">
              <User size={22} />
            </button>

          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white lg:hidden"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
            {/* ================= Mobile Menu ================= */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#2D2D2D] bg-[#111111]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-6 py-6">

              <nav>
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-gray-200 transition-all duration-300 hover:bg-[#8B3A2E]/20 hover:text-[#D4A017]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="my-6 h-px bg-[#2D2D2D]" />

              <div className="flex items-center justify-center gap-8">

                <button
                  aria-label="Search"
                  className="rounded-full bg-[#1B1B1B] p-3 text-gray-300 transition-all duration-300 hover:bg-[#8B3A2E] hover:text-white"
                >
                  <Search size={22} />
                </button>

                <button
                  aria-label="Shopping Cart"
                  className="rounded-full bg-[#1B1B1B] p-3 text-gray-300 transition-all duration-300 hover:bg-[#8B3A2E] hover:text-white"
                >
                  <ShoppingCart size={22} />
                </button>

                <button
                  aria-label="User Account"
                  className="rounded-full bg-[#1B1B1B] p-3 text-gray-300 transition-all duration-300 hover:bg-[#8B3A2E] hover:text-white"
                >
                  <User size={22} />
                </button>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}