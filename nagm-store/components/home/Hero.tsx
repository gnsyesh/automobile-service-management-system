"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#030712]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#111827] to-[#030712]" />

      {/* Decorative Glows */}
      <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-red-600/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/5 blur-[100px]" />

      <div
        className="
          relative
          mx-auto
          flex
          min-h-screen
          max-w-7xl
          flex-col-reverse
          items-center
          justify-center
          gap-14

          px-6
          pt-32
          pb-16

          sm:px-8
          sm:pt-28
          sm:pb-20

          md:gap-16

          lg:flex-row
          lg:justify-between
          lg:items-center
          lg:px-8
          lg:pt-20
          lg:pb-20

          xl:px-12
          2xl:max-w-[1500px]
        "
      >
        {/* ================= LEFT CONTENT ================= */}

        <motion.div
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center lg:text-left"
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-red-500 sm:text-sm">
            NEGM STORE
          </p>

          <h1
            className="
              font-extrabold
              leading-tight
              text-white

              text-4xl
              sm:text-5xl
              md:text-6xl
              lg:text-6xl
              xl:text-7xl
              2xl:text-8xl
            "
          >
            Drive With
            <span className="mt-2 block text-red-500">
              Confidence.
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-xl
              text-base
              leading-8
              text-slate-400

              sm:text-lg

              lg:mx-0
              lg:max-w-2xl
            "
          >
            Premium spare parts, genuine oils, batteries, filters,
            lubricants and automotive accessories built for
            performance, durability and reliability.
          </p>

          <div
            className="
              mt-10
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:justify-center

              lg:justify-start
            "
          >
            <Button
              size="lg"
              className="h-14 rounded-full bg-red-600 px-8 text-base font-semibold transition-all duration-300 hover:scale-105 hover:bg-red-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shop Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-slate-600 bg-transparent px-8 text-base font-semibold text-white transition-all duration-300 hover:border-red-500 hover:bg-red-600 hover:text-white"
            >
              Explore
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center lg:text-left">
            <div>
              <h3 className="text-2xl font-bold text-red-500">
                10K+
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Products
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-red-500">
                500+
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Brands
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-red-500">
                24/7
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Support
              </p>
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT IMAGE ================= */}
                <motion.div
  initial={{
    opacity: 0,
    x: 400,
    scale: 0.9,
    rotate: -3,
  }}
  animate={{
    opacity: 1,
    x: 0,
    scale: 1,
    rotate: 0,
  }}
  transition={{
    duration: 1.3,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="flex flex-1 items-center justify-center lg:justify-end"
>
  <div className="relative flex w-full items-center justify-center">
    <div className="absolute h-[260px] w-[260px] rounded-full bg-[#8B3A2E]/20 blur-3xl sm:h-[350px] sm:w-[350px] lg:h-[500px] lg:w-[500px]" />

    <Image
      src="/images/hero-car.png"
      alt="Hero Car"
      width={1600}
      height={1000}
      priority
      className="relative z-10 h-auto w-full max-w-[320px] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.65)] sm:max-w-[420px] md:max-w-[560px] lg:max-w-[700px] xl:max-w-[850px] 2xl:max-w-[950px]"
    />
  </div>
</motion.div>
        
      </div>
    </section>
  );
}