"use client";

import React from "react";
import { Phone, Mail, MapPin, Clock, Headphones } from "lucide-react";

export default function Contact() {
  return (
    <section className="py-20 bg-[#0A0A0A] border-t border-[#2D2D2D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017] flex items-center gap-1.5">
              <Headphones className="h-4 w-4" /> WE ARE HERE TO HELP
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Need Assistance Finding Parts?
            </h2>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Our team of automotive mechanical engineers is available 7 days a week to help you choose the exact fitting parts for your car.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Egypt Customer Support Hotline</div>
                  <div className="text-lg font-bold text-white">19888 / +20 100 123 4567</div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017] text-black">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Email Support</div>
                  <div className="text-base font-bold text-white">support@negmstore.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E] text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Headquarters & Central Warehouse</div>
                  <div className="text-sm font-bold text-white">Automotive Zone, 5th Settlement, New Cairo, Egypt</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B] p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Send Us A Direct Message</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Mahmoud"
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+20 100 000 0000"
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Inquiry / Car Details</label>
                  <textarea
                    rows={4}
                    placeholder="Provide your car make, model, year, and parts you are looking for..."
                    className="w-full rounded-xl border border-[#2D2D2D] bg-[#111111] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#8B3A2E] font-bold text-white text-sm hover:bg-[#a34436] transition shadow-lg"
                >
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
