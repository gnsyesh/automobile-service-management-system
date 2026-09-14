"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Sparkles,
  Award,
  Tag,
  Car,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductSpecification, ProductCompatibility } from "@/types";
import { categories } from "@/data/categories";
import { brands } from "@/data/brands";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { uploadToCloudinary } from "@/lib/cloudinary";

type ModalTab = "general" | "pricing" | "media" | "specs" | "fitment";

interface ProductFormData {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number | "";
  oldPrice: number | "";
  discount: number | "";
  stockCount: number | "";
  inStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isOffer: boolean;
  shortDescription: string;
  description: string;
  images: string[];
  specifications: ProductSpecification[];
  compatibility: ProductCompatibility[];
  features: string[];
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800";

export default function AdminProductsPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "bestSeller" | "featured" | "offer">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>("general");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cloudinary Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    id: "",
    name: "",
    sku: "",
    brand: "Mobil 1",
    category: "engine-oils",
    subcategory: "fully-synthetic",
    price: 1500,
    oldPrice: "",
    discount: "",
    stockCount: 20,
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    isOffer: false,
    shortDescription: "",
    description: "",
    images: [DEFAULT_IMAGE],
    specifications: [],
    compatibility: [],
    features: [],
  });

  // Fetch products exclusively from Firestore (single authoritative source)
  const fetchFirestoreProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      if (!snap.empty) {
        const firestoreList: Product[] = [];
        snap.forEach((d) => firestoreList.push({ id: d.id, ...(d.data() as any) }));
        setProductsList(firestoreList);
      } else {
        setProductsList([]);
      }
    } catch (e) {
      console.error("Error fetching products from Firestore:", e);
      showToast(
        language === "ar" ? "تعذر تحميل المنتجات من قاعدة البيانات." : "Failed to load products from Firestore.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirestoreProducts();
  }, []);

  // Subcategories available for currently selected category in form
  const availableSubcategories = useMemo(() => {
    const cat = categories.find((c) => c.slug === formData.category);
    return cat?.subcategories || [];
  }, [formData.category]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setIsDragging(false);
    setManualImageUrl("");
    setActiveModalTab("general");
    setFormData({
      id: `prod-${Date.now()}`,
      name: "",
      sku: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: "Mobil 1",
      category: "engine-oils",
      subcategory: "fully-synthetic",
      price: "",
      oldPrice: "",
      discount: "",
      stockCount: 15,
      inStock: true,
      isFeatured: false,
      isBestSeller: false,
      isOffer: false,
      shortDescription: "",
      description: "",
      images: [DEFAULT_IMAGE],
      specifications: [
        { label: "Viscosity", value: "5W-30" },
        { label: "Volume", value: "4 Liters" },
      ],
      compatibility: [],
      features: ["100% Genuine Guaranteed", "OEM Quality Standard"],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setIsDragging(false);
    setManualImageUrl("");
    setActiveModalTab("general");
    setFormData({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory || "",
      price: p.price,
      oldPrice: p.oldPrice ?? "",
      discount: p.discount ?? "",
      stockCount: p.stockCount ?? 0, // Fix stock 0 bug
      inStock: p.inStock,
      isFeatured: p.isFeatured ?? false,
      isBestSeller: p.isBestSeller ?? false,
      isOffer: p.isOffer ?? false,
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      images: p.images && p.images.length > 0 ? [...p.images] : [DEFAULT_IMAGE],
      specifications: p.specifications ? p.specifications.map((s) => ({ ...s })) : [],
      compatibility: p.compatibility ? p.compatibility.map((c) => ({ ...c })) : [],
      features: p.features ? [...p.features] : [],
    });
    setIsModalOpen(true);
  };

  // Cloudinary image upload handler
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

      setFormData((prev) => {
        // If the only current image is the default placeholder, replace it; otherwise append
        const filteredImgs = prev.images.filter((img) => img !== DEFAULT_IMAGE);
        return {
          ...prev,
          images: [...filteredImgs, result.secure_url],
        };
      });

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

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    const url = manualImageUrl.trim();
    setFormData((prev) => {
      const filteredImgs = prev.images.filter((img) => img !== DEFAULT_IMAGE);
      return {
        ...prev,
        images: [...filteredImgs, url],
      };
    });
    setManualImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updated.length > 0 ? updated : [DEFAULT_IMAGE],
      };
    });
  };

  const handleMakeCoverImage = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const img = prev.images[index];
      const rest = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: [img, ...rest],
      };
    });
  };

  // Specification handlers
  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: "", value: "" }],
    }));
  };

  const handleUpdateSpecification = (index: number, field: "label" | "value", val: string) => {
    setFormData((prev) => {
      const copy = [...prev.specifications];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, specifications: copy };
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // Vehicle compatibility handlers
  const handleAddCompatibility = () => {
    setFormData((prev) => ({
      ...prev,
      compatibility: [
        ...prev.compatibility,
        { make: "", model: "", yearStart: 2016, yearEnd: 2026, engine: "" },
      ],
    }));
  };

  const handleUpdateCompatibility = (
    index: number,
    field: keyof ProductCompatibility,
    val: any
  ) => {
    setFormData((prev) => {
      const copy = [...prev.compatibility];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, compatibility: copy };
    });
  };

  const handleRemoveCompatibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compatibility: prev.compatibility.filter((_, i) => i !== index),
    }));
  };

  // Drag & drop
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

  // Save product to Firestore with complete field preservation
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

    // Validations
    if (!formData.name.trim()) {
      showToast(language === "ar" ? "يرجى إدخال اسم المنتج" : "Product name is required", "error");
      setActiveModalTab("general");
      return;
    }

    if (!formData.sku.trim()) {
      showToast(language === "ar" ? "يرجى إدخال كود المنتج SKU" : "Product SKU is required", "error");
      setActiveModalTab("general");
      return;
    }

    // Check SKU uniqueness
    const duplicateSku = productsList.find(
      (p) =>
        p.sku.trim().toLowerCase() === formData.sku.trim().toLowerCase() &&
        p.id !== formData.id
    );
    if (duplicateSku) {
      showToast(
        language === "ar"
          ? `كود المنتج SKU مستخدم بالفعل في (${duplicateSku.name})`
          : `SKU already exists on (${duplicateSku.name})`,
        "error"
      );
      setActiveModalTab("general");
      return;
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      showToast(
        language === "ar"
          ? "يجب أن يكون السعر أكبر من صفر"
          : "Price must be greater than 0 EGP",
        "error"
      );
      setActiveModalTab("pricing");
      return;
    }

    if (formData.stockCount === "" || Number(formData.stockCount) < 0) {
      showToast(
        language === "ar"
          ? "لا يمكن أن يكون المخزون سالباً"
          : "Stock count cannot be negative",
        "error"
      );
      setActiveModalTab("pricing");
      return;
    }

    setIsSaving(true);

    try {
      // Clean up specifications (remove empty rows)
      const cleanSpecs = formData.specifications.filter(
        (s) => s.label.trim() && s.value.trim()
      );

      // Clean up compatibility (remove empty rows)
      const cleanCompat = formData.compatibility
        .filter((c) => c.make.trim() && c.model.trim())
        .map((c) => ({
          make: c.make.trim(),
          model: c.model.trim(),
          yearStart: Number(c.yearStart) || 2015,
          yearEnd: Number(c.yearEnd) || 2026,
          ...(c.engine && c.engine.trim() ? { engine: c.engine.trim() } : {}),
        }));

      // Construct clean product document preserving all untouched fields
      const productToSave: Product = {
        ...(editingProduct || {}),
        id: formData.id,
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        brand: formData.brand.trim(),
        category: formData.category,
        subcategory: formData.subcategory || "",
        price: Number(formData.price),
        ...(formData.oldPrice !== "" ? { oldPrice: Number(formData.oldPrice) } : {}),
        ...(formData.discount !== "" ? { discount: Number(formData.discount) } : {}),
        stockCount: Number(formData.stockCount || 0),
        inStock: Boolean(formData.inStock && Number(formData.stockCount) > 0),
        isFeatured: Boolean(formData.isFeatured),
        isBestSeller: Boolean(formData.isBestSeller),
        isOffer: Boolean(formData.isOffer),
        shortDescription:
          formData.shortDescription.trim() ||
          `${formData.name.trim()} - Genuine Automotive Spare Part`,
        description:
          formData.description.trim() ||
          `${formData.name.trim()} genuine spare part available at Negm Store Egypt.`,
        images: formData.images.length > 0 ? formData.images : [DEFAULT_IMAGE],
        specifications:
          cleanSpecs.length > 0
            ? cleanSpecs
            : editingProduct?.specifications || [{ label: "Quality", value: "100% Genuine OEM" }],
        features:
          formData.features.length > 0
            ? formData.features
            : editingProduct?.features || ["100% Genuine Quality Guaranteed"],
        ...(cleanCompat.length > 0
          ? { compatibility: cleanCompat }
          : editingProduct?.compatibility
          ? { compatibility: editingProduct.compatibility }
          : {}),
        rating: editingProduct?.rating ?? 5.0,
        reviewsCount: editingProduct?.reviewsCount ?? 0,
      };

      // Strip any undefined keys so Firestore doesn't error
      const cleanDoc: Record<string, any> = {};
      for (const [key, val] of Object.entries(productToSave)) {
        if (val !== undefined) {
          cleanDoc[key] = val;
        }
      }

      // Save directly to Firestore
      await setDoc(doc(db, "products", productToSave.id), cleanDoc);

      // Update state
      setProductsList((prev) => {
        const index = prev.findIndex((p) => p.id === productToSave.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = productToSave;
          return copy;
        }
        return [productToSave, ...prev];
      });

      showToast(
        language === "ar"
          ? "تم حفظ المنتج بنجاح في قاعدة بيانات المتجر!"
          : "Product saved successfully to store catalog!",
        "success"
      );
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save product to Firestore:", err);
      showToast(
        err?.message || "Failed to save product to Firestore.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Permanent deletion from Firestore
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProductsList((prev) => prev.filter((p) => p.id !== id));
      setDeleteTargetId(null);
      showToast(
        language === "ar"
          ? "تم حذف المنتج نهائياً من قاعدة البيانات."
          : "Product permanently deleted from database.",
        "info"
      );
    } catch (e: any) {
      console.error("Error deleting product from Firestore:", e);
      showToast(e?.message || "Error deleting product from Firestore.", "error");
    }
  };

  // Filtered products list
  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;

      if (stockFilter === "inStock" && (!p.inStock || (p.stockCount ?? 0) <= 0)) return false;
      if (stockFilter === "outOfStock" && (p.inStock && (p.stockCount ?? 0) > 0)) return false;

      if (badgeFilter === "bestSeller" && !p.isBestSeller) return false;
      if (badgeFilter === "featured" && !p.isFeatured) return false;
      if (badgeFilter === "offer" && !p.isOffer) return false;

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
  }, [productsList, selectedCategory, stockFilter, badgeFilter, searchQuery]);

  return (
    <div className="space-y-8 text-left rtl:text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2D2D2D] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
            CATALOG INVENTORY (FIRESTORE)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {language === "ar" ? "إدارة المنتجات" : "Product Management"} ({productsList.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            {language === "ar"
              ? "الكتالوج الرسمي المباشر المتصل بقاعدة بيانات فايرستور وسحابة كلاوديناري"
              : "Authoritative product inventory connected directly to Firestore and Cloudinary"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFirestoreProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-[#D4A017] transition shadow-sm disabled:opacity-50"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#D4A017]" : ""}`} />
            <span>{language === "ar" ? "تحديث" : "Refresh"}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B3A2E] text-white text-xs font-bold hover:bg-[#a34436] transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>{language === "ar" ? "إضافة منتج جديد" : "Add New Product"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D4A017]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "ar"
                ? "ابحث بالاسم، الماركة، أو SKU..."
                : "Search name, brand, SKU..."
            }
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] py-2.5 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-[#D4A017] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none font-medium"
          >
            <option value="all">{language === "ar" ? "جميع الأقسام" : "All Categories"}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none font-medium"
          >
            <option value="all">{language === "ar" ? "حالة المخزون (الكل)" : "Stock Status (All)"}</option>
            <option value="inStock">{language === "ar" ? "متوفر بالمخزن فقط" : "In Stock Only"}</option>
            <option value="outOfStock">{language === "ar" ? "نفد من المخزن" : "Out of Stock Only"}</option>
          </select>
        </div>

        {/* Badge Filter */}
        <div>
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#D4A017] focus:outline-none font-medium"
          >
            <option value="all">{language === "ar" ? "شارة الترويج (الكل)" : "Promotions & Badges (All)"}</option>
            <option value="bestSeller">{language === "ar" ? "الأكثر مبيعاً (Best Seller)" : "Best Sellers Only"}</option>
            <option value="featured">{language === "ar" ? "منتجات مميزة (Featured)" : "Featured Only"}</option>
            <option value="offer">{language === "ar" ? "عروض وتخفيضات (Offers)" : "Special Offers Only"}</option>
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
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#2D2D2D]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#D4A017] mb-2" />
                    <p>{language === "ar" ? "جارٍ تحميل الكتالوج من فايرستور..." : "Loading catalog from Firestore..."}</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-gray-300">
                      {language === "ar" ? "لا توجد منتجات مطابقة للبحث" : "No matching products found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const stock = prod.stockCount ?? 0;
                  const isAvailable = prod.inStock && stock > 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-[#181818] transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 rounded-xl bg-slate-100 dark:bg-[#111111] overflow-hidden p-1 border border-slate-200 dark:border-[#2D2D2D]">
                            <Image
                              src={prod.images?.[0] || DEFAULT_IMAGE}
                              alt=""
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                              {prod.shortDescription || prod.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[#D4A017] font-semibold">{prod.sku}</div>
                        <div className="text-[11px] text-slate-500 dark:text-gray-400">{prod.brand}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-gray-300 font-medium text-[11px] inline-block">
                          {prod.category}
                        </span>
                        {prod.subcategory && (
                          <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 capitalize">
                            {prod.subcategory}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {prod.price.toLocaleString()} EGP
                        </div>
                        {prod.oldPrice && prod.oldPrice > prod.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {prod.oldPrice.toLocaleString()} EGP
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {stock === 0 ? "0 in stock (Out)" : "Out of stock"}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {prod.isBestSeller && (
                            <span
                              title="Best Seller"
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            >
                              <Award className="h-3 w-3" />
                              Best Seller
                            </span>
                          )}
                          {prod.isFeatured && (
                            <span
                              title="Featured"
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            >
                              <Sparkles className="h-3 w-3" />
                              Featured
                            </span>
                          )}
                          {prod.isOffer && (
                            <span
                              title="Offer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            >
                              <Tag className="h-3 w-3" />
                              Offer
                            </span>
                          )}
                          {!prod.isBestSeller && !prod.isFeatured && !prod.isOffer && (
                            <span className="text-[10px] text-slate-400 dark:text-gray-600">Standard</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2D2D2D] hover:border-[#D4A017] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteTargetId(prod.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition shadow-sm"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#151515] p-5 sm:p-7 shadow-2xl space-y-4 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] pb-3 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-[#D4A017] uppercase tracking-wider">
                  {editingProduct ? "EDIT CATALOG PRODUCT" : "NEW CATALOG PRODUCT"}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingProduct ? editingProduct.name : language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-[#2D2D2D] scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalTab("general")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeModalTab === "general"
                    ? "bg-[#8B3A2E] text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                General Info
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("pricing")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeModalTab === "pricing"
                    ? "bg-[#8B3A2E] text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Pricing & Stock
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("media")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  activeModalTab === "media"
                    ? "bg-[#8B3A2E] text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Images</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {formData.images.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("specs")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  activeModalTab === "specs"
                    ? "bg-[#8B3A2E] text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Specifications</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {formData.specifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("fitment")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  activeModalTab === "fitment"
                    ? "bg-[#8B3A2E] text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Car className="h-3 w-3" />
                <span>Compatibility</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {formData.compatibility.length}
                </span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* TAB 1: GENERAL INFO */}
              {activeModalTab === "general" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mobil 1 ESP 5W-30 Fully Synthetic Engine Oil - 4L"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                        SKU (Stock Keeping Unit) *
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. NS-OIL-001"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                        Brand *
                      </label>
                      <input
                        type="text"
                        list="brand-suggestions"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g. Mobil 1, Castrol, Shell"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-medium"
                      />
                      <datalist id="brand-suggestions">
                        {brands.map((b) => (
                          <option key={b.id} value={b.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          const catObj = categories.find((c) => c.slug === newCat);
                          const defaultSub = catObj?.subcategories?.[0]?.slug || "";
                          setFormData({
                            ...formData,
                            category: newCat,
                            subcategory: defaultSub,
                          });
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-medium"
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                        Subcategory
                      </label>
                      <select
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-medium"
                      >
                        <option value="">-- None / General --</option>
                        {availableSubcategories.map((sc) => (
                          <option key={sc.slug} value={sc.slug}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                      Short Description (Highlights / Subtitle)
                    </label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDescription: e.target.value })
                      }
                      placeholder="Quick summary shown on cards and product header..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                      Full Product Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed automotive specifications, benefits, warranty and engineering highlights..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & STOCK & BADGES */}
              {activeModalTab === "pricing" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2D2D2D] space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-[#D4A017]">
                      Pricing Configuration
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                          Selling Price (EGP) *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setFormData((prev) => {
                              const updated: ProductFormData = { ...prev, price: val };
                              // Auto calculate discount if oldPrice is set
                              if (typeof val === "number" && typeof prev.oldPrice === "number" && prev.oldPrice > val) {
                                updated.discount = Math.round(((prev.oldPrice - val) / prev.oldPrice) * 100);
                              }
                              return updated;
                            });
                          }}
                          placeholder="1500"
                          required
                          min={1}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                          Original Price (Old EGP)
                        </label>
                        <input
                          type="number"
                          value={formData.oldPrice}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setFormData((prev) => {
                              const updated: ProductFormData = { ...prev, oldPrice: val };
                              if (typeof val === "number" && typeof prev.price === "number" && val > prev.price) {
                                updated.discount = Math.round(((val - prev.price) / val) * 100);
                              }
                              return updated;
                            });
                          }}
                          placeholder="Optional strikethrough"
                          min={0}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount: e.target.value === "" ? "" : Number(e.target.value),
                            })
                          }
                          placeholder="e.g. 15"
                          min={0}
                          max={100}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2D2D2D] space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-[#D4A017]">
                      Inventory & Availability
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">
                          Available Stock Units Count
                        </label>
                        <input
                          type="number"
                          value={formData.stockCount}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : Number(e.target.value);
                            setFormData({
                              ...formData,
                              stockCount: val,
                              inStock: typeof val === "number" && val > 0 ? formData.inStock : false,
                            });
                          }}
                          min={0}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-semibold"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Enter 0 if out of stock. Stock 0 will display properly as 0 in stock.
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.inStock}
                            onChange={(e) =>
                              setFormData({ ...formData, inStock: e.target.checked })
                            }
                            className="h-4 w-4 rounded accent-[#8B3A2E] cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              Product is In Stock & Active
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-gray-400">
                              Customers can add this item to their cart immediately
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Homepage Visibility */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#2D2D2D] space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-[#D4A017]">
                      Promotional Badges & Homepage Placement
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] cursor-pointer hover:border-amber-500/50 transition">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller}
                          onChange={(e) =>
                            setFormData({ ...formData, isBestSeller: e.target.checked })
                          }
                          className="mt-0.5 h-4 w-4 rounded accent-[#D4A017] cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-amber-500" />
                            <span>Best Seller</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                            Show in Top Selling Products
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] cursor-pointer hover:border-purple-500/50 transition">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({ ...formData, isFeatured: e.target.checked })
                          }
                          className="mt-0.5 h-4 w-4 rounded accent-purple-600 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            <span>Featured</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                            Show in Homepage Featured grid
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] cursor-pointer hover:border-red-500/50 transition">
                        <input
                          type="checkbox"
                          checked={formData.isOffer}
                          onChange={(e) =>
                            setFormData({ ...formData, isOffer: e.target.checked })
                          }
                          className="mt-0.5 h-4 w-4 rounded accent-[#8B3A2E] cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-[#8B3A2E]" />
                            <span>Special Offer</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                            Badge as discounted deal
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA (Cloudinary Multi-Image Gallery) */}
              {activeModalTab === "media" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        Product Gallery Images ({formData.images.length})
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        First image serves as the main catalog cover photo. Cloudinary hosted.
                      </p>
                    </div>
                  </div>

                  {/* Existing Images Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl border p-2 bg-slate-50 dark:bg-[#111111] overflow-hidden group ${
                          idx === 0
                            ? "border-[#D4A017] shadow-md ring-1 ring-[#D4A017]/40"
                            : "border-slate-200 dark:border-[#2D2D2D]"
                        }`}
                      >
                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A]">
                          <Image
                            src={imgUrl}
                            alt={`Image ${idx + 1}`}
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D4A017] text-black shadow">
                              Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMakeCoverImage(idx)}
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white hover:bg-[#8B3A2E] transition shadow"
                            >
                              Set Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition shadow"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Host tag */}
                        <div className="mt-2 text-[10px] truncate font-mono text-slate-500 dark:text-gray-400">
                          {imgUrl.includes("cloudinary.com") ? (
                            <span className="text-emerald-500 font-semibold">Cloudinary</span>
                          ) : (
                            <span>External URL</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cloudinary Drag & Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8B3A2E]/10 text-[#8B3A2E] dark:bg-[#D4A017]/10 dark:text-[#D4A017]">
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <UploadCloud className="h-5 w-5" />
                        )}
                      </div>

                      {isUploading ? (
                        <div className="w-full max-w-xs space-y-1.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-gray-200">
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
                              : "Click to upload another product image or drag & drop"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400">
                            PNG, JPG, WebP, AVIF • Auto uploads to Cloudinary (negm-store/products)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111]">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-gray-400 mb-1">
                      {language === "ar" ? "أو أضف رابط صورة مباشر:" : "Or add image URL directly:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                        className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualImage}
                        className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-[#202020] text-white font-bold hover:bg-[#8B3A2E] transition shadow-sm shrink-0"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SPECIFICATIONS */}
              {activeModalTab === "specs" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        Product Specifications Key-Value Pairs
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        Technical attributes shown on the product details table (e.g. Viscosity, Volume, Standards).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 hover:bg-[#D4A017] hover:text-black font-bold transition text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Spec Row</span>
                    </button>
                  </div>

                  {formData.specifications.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-[#2D2D2D] rounded-2xl">
                      <p className="text-slate-500 text-xs">
                        No technical specifications yet. Click "Add Spec Row" above to add attributes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111]"
                        >
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) =>
                              handleUpdateSpecification(idx, "label", e.target.value)
                            }
                            placeholder="Label (e.g. Viscosity)"
                            className="w-1/3 p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] font-semibold text-xs"
                          />

                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) =>
                              handleUpdateSpecification(idx, "value", e.target.value)
                            }
                            placeholder="Value (e.g. 5W-30 / 4 Liters)"
                            className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveSpecification(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition shrink-0"
                            title="Remove specification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: COMPATIBILITY */}
              {activeModalTab === "fitment" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        Vehicle Fitment & Compatibility
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        Powers the shop exact-fit vehicle selector (e.g. Toyota Corolla 2014-2026).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCompatibility}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 hover:bg-[#D4A017] hover:text-black font-bold transition text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Fitment Row</span>
                    </button>
                  </div>

                  {formData.compatibility.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-[#2D2D2D] rounded-2xl">
                      <p className="text-slate-500 text-xs">
                        Universal part or no specific vehicle fitment listed yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.compatibility.map((compat, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#111111] items-center"
                        >
                          <input
                            type="text"
                            value={compat.make}
                            onChange={(e) =>
                              handleUpdateCompatibility(idx, "make", e.target.value)
                            }
                            placeholder="Make (e.g. Toyota)"
                            className="p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs font-semibold"
                          />

                          <input
                            type="text"
                            value={compat.model}
                            onChange={(e) =>
                              handleUpdateCompatibility(idx, "model", e.target.value)
                            }
                            placeholder="Model (e.g. Corolla)"
                            className="p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs font-semibold"
                          />

                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={compat.yearStart}
                              onChange={(e) =>
                                handleUpdateCompatibility(
                                  idx,
                                  "yearStart",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="From"
                              className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="number"
                              value={compat.yearEnd}
                              onChange={(e) =>
                                handleUpdateCompatibility(
                                  idx,
                                  "yearEnd",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="To"
                              className="w-1/2 p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs"
                            />
                          </div>

                          <input
                            type="text"
                            value={compat.engine || ""}
                            onChange={(e) =>
                              handleUpdateCompatibility(idx, "engine", e.target.value)
                            }
                            placeholder="Engine (e.g. 1.6L Dual VVT-i)"
                            className="p-2 rounded-lg border border-slate-200 dark:border-[#2D2D2D] bg-white dark:bg-[#0E0E0E] text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A017] text-xs"
                          />

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveCompatibility(idx)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                              title="Remove vehicle fitment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-[#2D2D2D] shrink-0">
                <div className="text-[11px] text-slate-500">
                  {editingProduct ? `ID: ${editingProduct.id}` : "Auto-assigned ID"}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D2D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading || isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#8B3A2E] text-white font-bold hover:bg-[#a34436] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs"
                  >
                    {(isUploading || isSaving) && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {isUploading
                        ? "Uploading Image..."
                        : isSaving
                        ? "Saving Product..."
                        : editingProduct
                        ? "Update Product"
                        : "Save Product"}
                    </span>
                  </button>
                </div>
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
              {language === "ar" ? "تأكيد حذف المنتج" : "Confirm Permanent Deletion"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {language === "ar"
                ? "سيتم حذف هذا المنتج نهائياً من قاعدة بيانات المتجر ولن يظهر بعد الآن في أي قسم."
                : "This will permanently delete the product from the Firestore store database. It will no longer appear anywhere in the store."}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D2D] text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
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
