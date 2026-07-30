"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useVehicle } from "@/context/VehicleContext";
import { useToast } from "@/context/ToastContext";
import {
  Star,
  ShoppingBag,
  Heart,
  CheckCircle,
  AlertTriangle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ArrowRight,
  Share2,
  Check,
  ChevronRight,
  Car,
  PackageCheck
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { selectedVehicle, isCompatible, setIsVehicleModalOpen } = useVehicle();
  const { showToast } = useToast();

  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "compatibility" | "description" | "reviews">("specs");

  const isLiked = isInWishlist(product.id);
  const fitsActiveVehicle = selectedVehicle ? isCompatible(product) : null;

  // Bundle Items for Frequently Bought Together
  const bundleItems = (product.frequentlyBoughtTogetherIds || [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const bundleTotalPrice = product.price + bundleItems.reduce((sum, item) => sum + (item?.price || 0), 0);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleAddBundleToCart = () => {
    addToCart(product, 1);
    bundleItems.forEach((item) => {
      if (item) addToCart(item, 1);
    });
    showToast("Bundle package added to cart!", "success");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    }
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-8 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-[#D4A017] transition">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
          <Link href="/shop" className="hover:text-[#D4A017] transition">Shop Parts</Link>
          <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#D4A017] transition capitalize">
            {product.category.replaceAll("-", " ")}
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-600 shrink-0" />
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Details Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Gallery Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative h-[380px] sm:h-[450px] w-full overflow-hidden rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B] p-6 flex items-center justify-center shadow-2xl">
              <Image
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 transition-transform duration-500 hover:scale-105"
              />

              {product.discount && (
                <span className="absolute top-4 left-4 rounded-full bg-[#8B3A2E] px-3.5 py-1 text-xs font-black text-white shadow-lg">
                  -{product.discount}% OFF
                </span>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#111111]/80 text-gray-300 hover:text-white hover:bg-[#8B3A2E] transition shadow-md"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 bg-[#1B1B1B] transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#D4A017] shadow-lg scale-95"
                        : "border-[#2D2D2D] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Info Column */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                  {product.brand} • SKU: {product.sku}
                </span>

                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  product.inStock ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}>
                  {product.inStock ? `In Stock (${product.stockCount} available)` : "Out of Stock"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center text-[#D4A017]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-600"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-white">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500">({product.reviewsCount} verified customer reviews)</span>
              </div>
            </div>

            {/* Price Banner */}
            <div className="rounded-2xl border border-[#2D2D2D] bg-[#1B1B1B]/80 p-5 flex items-baseline gap-4 shadow-lg">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {product.price.toLocaleString()} <span className="text-lg text-[#D4A017] font-bold">EGP</span>
              </span>
              {product.oldPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {product.oldPrice.toLocaleString()} EGP
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto font-medium">Includes 14% Egyptian VAT</span>
            </div>

            {/* Vehicle Fitment Notice */}
            <div className="rounded-2xl border border-[#D4A017]/30 bg-[#1B1B1B]/90 p-4">
              {selectedVehicle ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {fitsActiveVehicle ? (
                      <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {fitsActiveVehicle
                          ? `Guaranteed Fit for Your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                          : `May NOT Fit Your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {fitsActiveVehicle ? "Direct OEM specification match." : "Check vehicle compatibility list below."}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVehicleModalOpen(true)}
                    className="text-xs font-bold text-[#D4A017] hover:underline shrink-0"
                  >
                    Change Car
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Car className="h-5 w-5 text-[#D4A017]" />
                    <span className="text-xs font-bold text-white">Select your vehicle to confirm fitment</span>
                  </div>
                  <button
                    onClick={() => setIsVehicleModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition"
                  >
                    Check Fitment
                  </button>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-4 pt-4 border-t border-[#2D2D2D]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
                <div className="flex items-center rounded-xl border border-[#2D2D2D] bg-[#111111]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-gray-300 hover:text-white transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                    className="p-2.5 text-gray-300 hover:text-white transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#8B3A2E] py-4 text-sm font-bold text-white hover:bg-[#a34436] transition shadow-xl hover:shadow-[0_10px_25px_rgba(139,58,46,0.3)]"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Add {quantity} to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#D4A017] bg-[#D4A017] py-4 text-sm font-black text-black hover:bg-yellow-400 transition shadow-xl"
                >
                  <span>Buy Now (Instant Checkout)</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 rounded-xl border transition ${
                    isLiked
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "border-[#2D2D2D] bg-[#1B1B1B] text-gray-400 hover:text-white"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Delivery & Guarantee Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2D2D2D] text-center text-[11px] font-semibold text-gray-400">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1B1B1B]">
                <Truck className="h-4 w-4 text-[#D4A017]" />
                <span>Fast Egypt Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1B1B1B]">
                <ShieldCheck className="h-4 w-4 text-[#D4A017]" />
                <span>100% Genuine Seals</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#1B1B1B]">
                <RotateCcw className="h-4 w-4 text-[#D4A017]" />
                <span>14-Day Free Returns</span>
              </div>
            </div>

          </div>

        </div>

        {/* Frequently Bought Together Bundle Module */}
        {bundleItems.length > 0 && (
          <div className="mt-16 rounded-3xl border border-[#D4A017]/30 bg-[#1B1B1B]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <PackageCheck className="h-5 w-5 text-[#D4A017]" /> Frequently Bought Together Package
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex flex-wrap items-center gap-4">
                {/* Main item */}
                <div className="flex items-center gap-3 rounded-2xl border border-[#2D2D2D] bg-[#111111] p-3 w-64">
                  <div className="relative h-14 w-14 shrink-0 bg-[#1B1B1B] rounded-xl overflow-hidden">
                    <Image src={product.images[0]} alt="" fill className="object-contain p-1" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white line-clamp-1">{product.name}</div>
                    <div className="text-[#D4A017] font-extrabold">{product.price.toLocaleString()} EGP</div>
                  </div>
                </div>

                {/* Plus sign */}
                {bundleItems.map((item, idx) => (
                  <React.Fragment key={item?.id}>
                    <Plus className="h-5 w-5 text-[#D4A017]" />
                    <div className="flex items-center gap-3 rounded-2xl border border-[#2D2D2D] bg-[#111111] p-3 w-64">
                      <div className="relative h-14 w-14 shrink-0 bg-[#1B1B1B] rounded-xl overflow-hidden">
                        <Image src={item?.images[0] || ""} alt="" fill className="object-contain p-1" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-white line-clamp-1">{item?.name}</div>
                        <div className="text-[#D4A017] font-extrabold">{item?.price.toLocaleString()} EGP</div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Bundle Action */}
              <div className="border-t md:border-t-0 md:border-l border-[#2D2D2D] pt-4 md:pt-0 md:pl-6 text-center md:text-right shrink-0">
                <div className="text-xs text-gray-400">Total Bundle Price:</div>
                <div className="text-2xl font-black text-white">{bundleTotalPrice.toLocaleString()} <span className="text-sm text-[#D4A017]">EGP</span></div>
                <button
                  onClick={handleAddBundleToCart}
                  className="mt-3 px-6 py-3 rounded-xl bg-[#8B3A2E] text-xs font-bold text-white hover:bg-[#a34436] transition shadow-lg"
                >
                  Add Complete Package to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Details Tabs Section */}
        <div className="mt-16 rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#2D2D2D] pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === "specs" ? "bg-[#8B3A2E] text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("compatibility")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === "compatibility" ? "bg-[#8B3A2E] text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Compatible Vehicles ({product.compatibility?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === "description" ? "bg-[#8B3A2E] text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Full Description & Features
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === "reviews" ? "bg-[#8B3A2E] text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Customer Reviews ({product.reviewsCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            
            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#111111] border border-[#2D2D2D] text-xs">
                    <span className="font-semibold text-gray-400">{spec.label}</span>
                    <span className="font-bold text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Compatibility Tab */}
            {activeTab === "compatibility" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-4">
                  This part is certified compatible with the following vehicle models in Egypt:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.compatibility?.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-[#2D2D2D]">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-white">{comp.make} {comp.model} ({comp.yearStart}–{comp.yearEnd})</div>
                        {comp.engine && <div className="text-gray-400 text-[11px]">Engine: {comp.engine}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
                <p>{product.description}</p>

                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white text-base mb-3">Key Features & Benefits</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#111111] border border-[#2D2D2D]">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">{product.rating}</div>
                    <div className="flex items-center text-[#D4A017] mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{product.reviewsCount} reviews</div>
                  </div>
                  <div className="flex-1 text-xs text-gray-400">
                    <div>100% verified buyers in Egypt recommend this product.</div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Related Products Carousel/Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6">Related Automotive Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}
