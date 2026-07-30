"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Droplet, Settings, Disc, Filter, Zap, Shield, Sparkles, Smartphone, Wrench, CircleDot, Lightbulb, Car, Thermometer, FlaskConical, Hammer } from "lucide-react";
import { categories } from "@/data/categories";

const iconMap: Record<string, React.ReactNode> = {
  Droplet: <Droplet className="h-6 w-6 text-[#D4A017]" />,
  Settings: <Settings className="h-6 w-6 text-[#D4A017]" />,
  Disc: <Disc className="h-6 w-6 text-[#D4A017]" />,
  Filter: <Filter className="h-6 w-6 text-[#D4A017]" />,
  Zap: <Zap className="h-6 w-6 text-[#D4A017]" />,
  FlaskConical: <FlaskConical className="h-6 w-6 text-[#D4A017]" />,
  Thermometer: <Thermometer className="h-6 w-6 text-[#D4A017]" />,
  Wrench: <Wrench className="h-6 w-6 text-[#D4A017]" />,
  Shield: <Shield className="h-6 w-6 text-[#D4A017]" />,
  CircleDot: <CircleDot className="h-6 w-6 text-[#D4A017]" />,
  Lightbulb: <Lightbulb className="h-6 w-6 text-[#D4A017]" />,
  Car: <Car className="h-6 w-6 text-[#D4A017]" />,
  Sparkles: <Sparkles className="h-6 w-6 text-[#D4A017]" />,
  Smartphone: <Smartphone className="h-6 w-6 text-[#D4A017]" />,
  Hammer: <Hammer className="h-6 w-6 text-[#D4A017]" />,
};

export default function Categories() {
  return (
    <section className="py-20 bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              AUTOMOTIVE SECTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Browse By Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D4A017] hover:underline"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative flex flex-col items-center justify-between rounded-2xl border border-[#2D2D2D] bg-[#1B1B1B]/80 p-5 text-center backdrop-blur-xl transition-all duration-300 hover:border-[#D4A017] hover:bg-[#8B3A2E]/20 hover:-translate-y-1.5 shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111111] border border-[#2D2D2D] group-hover:border-[#D4A017] transition-colors">
                  {iconMap[cat.iconName] || <Wrench className="h-6 w-6 text-[#D4A017]" />}
                </div>

                <h3 className="mt-4 text-sm font-bold text-white group-hover:text-[#D4A017] transition-colors">
                  {cat.name}
                </h3>

                <span className="mt-1 text-[11px] text-gray-500 font-medium">
                  {cat.subcategories.length} Subcategories
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
