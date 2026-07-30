"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import ProductCard from "@/components/common/ProductCard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { brands } from "@/data/brands";
import { useVehicle } from "@/context/VehicleContext";
import { Search, Filter, Grid, List, SlidersHorizontal, RefreshCw, Car, Check, ChevronDown } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialCompatible = searchParams.get("compatible") === "true";

  const { selectedVehicle, isCompatible, setIsVehicleModalOpen } = useVehicle();

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand !== "all" ? [initialBrand] : []);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(initialCompatible);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku && !matchesCategory) return false;
      }

      // Category
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }

      // Brand
      if (selectedBrands.length > 0 && !selectedBrands.some((b) => b.toLowerCase() === p.brand.toLowerCase() || b.toLowerCase() === p.brand.replaceAll(" ", "-").toLowerCase())) {
        return false;
      }

      // Price
      if (p.price > maxPrice) {
        return false;
      }

      // In Stock
      if (inStockOnly && !p.inStock) {
        return false;
      }

      // Minimum Rating
      if (p.rating < minRating) {
        return false;
      }

      // Vehicle Compatibility
      if (onlyCompatible && selectedVehicle) {
        if (!isCompatible(p)) return false;
      }

      return true;
    });
  }, [searchQuery, categoryFilter, selectedBrands, maxPrice, inStockOnly, minRating, onlyCompatible, selectedVehicle, isCompatible]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const copy = [...filteredProducts];
    if (sortOption === "price-low") {
      return copy.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      return copy.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      return copy.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "latest") {
      return copy.sort((a, b) => b.id.localeCompare(a.id));
    } else {
      // Popular / Default
      return copy.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }
  }, [filteredProducts, sortOption]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const handleBrandToggle = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug)
        ? prev.filter((b) => b !== brandSlug)
        : [...prev, brandSlug]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setCategoryFilter("all");
    setSelectedBrands([]);
    setSearchQuery("");
    setMaxPrice(10000);
    setInStockOnly(false);
    setOnlyCompatible(false);
    setMinRating(0);
    setSortOption("popular");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#111111] text-gray-100 flex flex-col pt-32 pb-20">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2D2D] pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
              LUXURY SPARE PARTS CATALOG
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Shop Automotive Products
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Showing {sortedProducts.length} authentic parts and fluids across Egypt
            </p>
          </div>

          {/* Active Vehicle Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#D4A017]/40 bg-[#1B1B1B] px-4 py-2.5 text-xs font-bold text-white hover:border-[#D4A017] transition shadow-md"
            >
              <Car className="h-4 w-4 text-[#D4A017]" />
              <span>
                {selectedVehicle
                  ? `Active Vehicle: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                  : "Select My Car To Filter Fitment"}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4A017]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by part name, SKU (e.g. NS-OIL-001), or brand..."
              className="w-full rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-400 focus:border-[#D4A017] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] px-4 py-2.5 text-xs font-bold text-white hover:border-[#D4A017]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#D4A017]" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-[#2D2D2D] rounded-xl bg-[#1B1B1B] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-[#8B3A2E] text-white" : "text-gray-400 hover:text-white"
                }`}
                aria-label="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list" ? "bg-[#8B3A2E] text-white" : "text-gray-400 hover:text-white"
                }`}
                aria-label="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] px-3 py-2 text-xs text-white focus:border-[#D4A017] focus:outline-none font-semibold"
              >
                <option value="popular">Most Popular</option>
                <option value="latest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Filter Column */}
          <aside className={`lg:col-span-3 space-y-6 ${isMobileFilterOpen ? "block" : "hidden lg:block"}`}>
            <div className="rounded-2xl border border-[#2D2D2D] bg-[#1B1B1B]/90 p-5 backdrop-blur-xl space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#D4A017]" /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#D4A017] hover:underline flex items-center gap-1"
                >
                  Reset <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              {/* Vehicle Compatibility Filter */}
              {selectedVehicle && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyCompatible}
                      onChange={(e) => setOnlyCompatible(e.target.checked)}
                      className="rounded accent-[#D4A017]"
                    />
                    <span className="text-xs font-bold text-emerald-300">
                      Fits My {selectedVehicle.make} {selectedVehicle.model} Only
                    </span>
                  </label>
                </div>
              )}

              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Categories</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      categoryFilter === "all" ? "bg-[#8B3A2E] text-white" : "text-gray-300 hover:bg-[#252525]"
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] opacity-70">{products.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.slug).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategoryFilter(cat.slug);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          categoryFilter === cat.slug ? "bg-[#8B3A2E] text-white" : "text-gray-300 hover:bg-[#252525]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Brands</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {brands.map((b) => {
                    const isSelected = selectedBrands.includes(b.slug);
                    return (
                      <label key={b.id} className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBrandToggle(b.slug)}
                          className="rounded accent-[#8B3A2E]"
                        />
                        <span>{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
                  <span>Max Price:</span>
                  <span className="text-[#D4A017]">{maxPrice.toLocaleString()} EGP</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={10000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#8B3A2E]"
                />
              </div>

              {/* In Stock Only */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="rounded accent-[#8B3A2E]"
                  />
                  <span>In Stock Items Only</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Main Products Grid Column */}
          <main className="lg:col-span-9">
            {paginatedProducts.length > 0 ? (
              <>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] text-xs font-bold text-white hover:border-[#D4A017] disabled:opacity-40 transition"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                            currentPage === pageNum
                              ? "bg-[#8B3A2E] text-white shadow-lg border border-[#D4A017]"
                              : "bg-[#1B1B1B] text-gray-400 hover:text-white border border-[#2D2D2D]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-xl border border-[#2D2D2D] bg-[#1B1B1B] text-xs font-bold text-white hover:border-[#D4A017] disabled:opacity-40 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-[#2D2D2D] bg-[#1B1B1B] p-12 text-center">
                <Search className="mx-auto h-12 w-12 text-[#D4A017] mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-white">No Automotive Products Found</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  Try adjusting your filter criteria, resetting search parameters, or changing your active car selection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B3A2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#a34436] transition shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" /> Reset All Filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-bold">Loading Negm Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
