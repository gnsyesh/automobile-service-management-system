"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, MessageSquare, RefreshCw, ThumbsUp, HeartHandshake } from "lucide-react";
import { Order } from "@/types";
import { auth } from "@/lib/firebase";

interface OrderFeedbackModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (orderId: string) => void;
}

const ratingOptions = [
  { value: 1, label: "Poor", emoji: "😞" },
  { value: 2, label: "Fair", emoji: "😐" },
  { value: 3, label: "Good", emoji: "🙂" },
  { value: 4, label: "Very Good", emoji: "😊" },
  { value: 5, label: "Excellent", emoji: "🌟" },
];

export default function OrderFeedbackModal({
  order,
  isOpen,
  onClose,
  onSubmitted,
}: OrderFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setErrorMessage("Please sign in to submit feedback");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/orders/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to submit feedback");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSubmitted(order.id);
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1B1B1B] p-6 sm:p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
            aria-label="Close feedback modal"
          >
            <X className="h-5 w-5" />
          </button>

          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Thank You for Your Feedback!
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-xs mx-auto">
                Your review of our delivery and overall service helps us maintain the highest quality for automotive enthusiasts across Egypt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Order Delivered! 🎉
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  How was your overall experience?
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Order <span className="font-bold text-[#D4A017]">#{order.id}</span>
                </p>
              </div>

              {/* Overall Satisfaction */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 text-center">
                  Overall Service & Delivery Satisfaction
                </label>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {ratingOptions.map((opt) => {
                    const isSelected = rating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRating(opt.value)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-[#D4A017] bg-[#D4A017]/10 text-[#D4A017] shadow-sm scale-105"
                            : "border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="mt-1 text-[11px] font-bold leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">
                  Share your experience with our packaging, speed, or team (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="e.g. Prompt delivery, safe packaging, genuine seals intact!"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#D4A017] focus:outline-none transition resize-none"
                />
                <div className="flex justify-end text-[10px] text-slate-400">
                  {comment.length}/500
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 text-center">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#222222] transition"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      <span>Give Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
