"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  ImageIcon,
  Loader2,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { products as localProducts } from "@/data/products";
import { categories } from "@/data/categories";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function AdminProductsPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [productsList, setProductsList] = useState<Product[]>(localProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Cloudinary Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    sku: "",
    brand: "",
    category: "engine-oils",
    subcategory: "synthetic",
    price: 1500,
    stockCount: 20,
    inStock: true,
    shortDescription: "",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800",
  });

  const fetchFirestoreProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      if (!snap.empty) {
        const firestoreList: Product[] = [];
        snap.forEach((d) => firestoreList.push({ id: d.id, ...(d.data() as any) }));

        // Merge firestore list with localProducts (overriding local if matching id)
        const firestoreIds = new Set(firestoreList.map((p) => p.id));
        const merged = [
          ...firestoreList,
          ...localProducts.filter((p) => !firestoreIds.has(p.id)),
        ];
        setProductsList(merged);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  useEffect(() => {
    fetchFirestoreProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setIsDragging(false);
    setFormData({
      id: `prod-${Date.now()}`,
      name: "",
      sku: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: "Mobil 1",
      category: "engine-oils",
      subcategory: "synthetic",
      price: 1200,
      stockCount: 15,
      inStock: true,
      shortDescription: "",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setIsDragging(false);
    setFormData({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory || "",
      price: p.price,
      stockCount: p.stockCount || 10,
      inStock: p.inStock,
      shortDescription: p.shortDescription || "",
      image: p.images[0] || "",
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      setFormData((prev) => ({ ...prev, image: result.secure_url }));
      showToast(
        language === "ar"
          ? "تم رفع الصورة إلى Cloudinary بنجاح!"
          : "Image uploaded to Cloudinary successfully!",
        "success"
      );
    } catch (err: any) {
      const msg = err?.message || "Failed to upload image to Cloudinary.";
      setUploadError(msg);
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      showToast(
        language === "ar"
          ? "يرجى الانتظار حتى يكتمل رفع الصورة."
          : "Please wait for image upload to complete.",
        "error"
      );
      return;
    }

    if (!formData.name || !formData.price) {
      showToast("Please fill in required product fields.", "error");
      return;
    }

    const newProd: Product = {
      id: formData.id,
      name: formData.name,
      sku: formData.sku,
      brand: formData.brand,
      category: formData.category,
      subcategory: formData.subcategory,
      price: Number(formData.price),
      inStock: formData.inStock,
      stockCount: Number(formData.stockCount),
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 1,
      images: [formData.image],
      shortDescription: formData.shortDescription || `${formData.name} - Genuine Automotive Spare Part`,
      description: editingProduct?.description || `${formData.name} genuine spare part available at Negm Store Egypt.`,
      specifications: editingProduct?.specifications || [{ label: "Standard", value: "OEM Genuine" }],
      features: editingProduct?.features || ["100% Genuine Quality"],
    };

    try {
      // Save to Firestore
      await setDoc(doc(db, "products", newProd.id), newProd);

      // Update local state
      setProductsList((prev) => {
        const index = prev.findIndex((p) => p.id === newProd.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = newProd;
          return copy;
        }
        return [newProd, ...prev];
      });

      showToast(
        language === "ar" ? "تم حفظ المنتج بنجاح في قاعدة البيانات!" : "Product saved successfully to database!",
        "success"
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save product to Firestore.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      setDeleteTargetId(null);
      showToast(
        language === "ar" ? "تم حذف المنتج بنجاح." : "Product deleted successfully.",
        "info"
      );
    } catch (e) {
      console.error(e);
      showToast("Error deleting product.", "error");
    }
  };

  const filtered = productsList.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 text-left rtl:text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            CATALOG INVENTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t("admin.products")} ({productsList.length})
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.addProduct")}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4A017]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث باسم المنتج، الماركة، أو الكود..." : "Search by product name, brand, or SKU..."}
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-[#D4A017] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold hidden sm:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none font-semibold"
          >
            <option value="all">{language === "ar" ? "جميع الأقسام" : "All Categories"}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-slate-50 dark:bg-[#1C1C1C] border-b border-slate-200 dark:border-[#2D2D2D] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU / Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-[#181818] transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-[#111111] overflow-hidden p-1 border border-slate-200 dark:border-transparent">
                        <Image
                          src={prod.images[0] || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800"}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-[#D4A017] font-semibold">{prod.sku}</div>
                    <div className="text-[11px] text-slate-500 dark:text-gray-400">{prod.brand}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-gray-300 font-medium text-[11px]">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {prod.price.toLocaleString()} EGP
                  </td>
                  <td className="py-3.5 px-4">
                    {prod.inStock ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {prod.stockCount || 10} in stock
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">Out of stock</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2D2D2D] hover:border-[#D4A017] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition"
                        title="Edit Product"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(prod.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingProduct ? t("admin.editProduct") : t("admin.addProduct")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">Price (EGP) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min={1}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-gray-400 font-bold mb-1">Stock Count</label>
                <input
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>

              {/* Product Image Section: Cloudinary Upload + Manual URL + Preview */}
              <div className="space-y-2 pt-1">
                <label className="block text-slate-700 dark:text-gray-300 font-bold">
                  {language === "ar" ? "صورة المنتج (Cloudinary)" : "Product Image (Cloudinary)"}
                </label>

                {/* Drag & Drop / Upload Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#D4A017] bg-[#D4A017]/10"
                      : "border-slate-300 dark:border-[#2D2D2D] hover:border-[#D4A017]/60 bg-slate-50 dark:bg-[#111111]"
                  } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFileChange(e.target.files[0]);
                      }
                    }}
                    accept="image/png,image/jpeg,image/webp,image/jpg,image/avif"
                    className="hidden"
                    disabled={isUploading}
                  />

                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B3A2E]/10 text-[#8B3A2E] dark:bg-[#D4A017]/10 dark:text-[#D4A017]">
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-5 w-5" />
                      )}
                    </div>

                    {isUploading ? (
                      <div className="w-full max-w-xs space-y-1.5">
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-200">
                          {language === "ar"
                            ? `جارٍ الرفع إلى Cloudinary... ${uploadProgress}%`
                            : `Uploading to Cloudinary... ${uploadProgress}%`}
                        </p>
                        <div className="w-full bg-slate-200 dark:bg-[#202020] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#8B3A2E] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200">
                          {language === "ar"
                            ? "اضغط لاختيار صورة من جهازك أو اسحبها هنا"
                            : "Click to upload product image or drag and drop"}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400">
                          PNG, JPG, WebP, AVIF (Max 10MB) • Uploads to Cloudinary (negm-store/products)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload Error Display */}
                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Image Preview & URL Row */}
                {formData.image && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#111111]">
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-transparent">
                      <Image
                        src={formData.image}
                        alt="Product preview"
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {formData.image.includes("cloudinary.com") ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Cloudinary Hosted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            <Link2 className="h-3 w-3" />
                            External URL
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate font-mono">
                        {formData.image}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-500/10"
                      title="Clear image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Manual Image URL Input fallback */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-gray-400 mb-1">
                    {language === "ar" ? "أو أدخل رابط الصورة يدوياً:" : "Or enter image URL manually:"}
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setUploadError(null);
                    }}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="accent-[#8B3A2E]"
                />
                <label htmlFor="inStock" className="text-slate-700 dark:text-gray-300 font-semibold cursor-pointer">
                  In Stock and Available for Immediate Delivery
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#2D2D2D]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl bg-[#8B3A2E] text-white font-bold hover:bg-[#a34436] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isUploading ? (language === "ar" ? "جارٍ الرفع..." : "Uploading...") : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-white dark:bg-[#151515] p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("admin.deleteConfirm")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              This action will permanently delete the product from the store catalog.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] text-xs font-semibold text-slate-600 dark:text-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteProduct(deleteTargetId)}
                className="px-5 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
