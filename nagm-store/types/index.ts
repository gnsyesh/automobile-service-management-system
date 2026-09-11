export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductCompatibility {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOffer?: boolean;
  images: string[];
  shortDescription: string;
  description: string;
  specifications: ProductSpecification[];
  features: string[];
  compatibility?: ProductCompatibility[];
  weight?: string;
  packageSize?: string;
  relatedProductIds?: string[];
  frequentlyBoughtTogetherIds?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName: string;
  subcategories: Subcategory[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
  description: string;
  featured?: boolean;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  engine: string;
}

export interface VehicleMake {
  name: string;
  models: {
    name: string;
    years: number[];
    engines: string[];
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSubtotal: number;
  description: string;
}

export interface Address {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  isDefault?: boolean;
}

export type UserRole = "user" | "admin";

export interface AdminRecord {
  uid: string;
  email: string;
  name: string;
  role: "admin";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  savedAddress?: Address;
  shippingAddress?: Address;
  role?: UserRole;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderCustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  customerDetails?: OrderCustomerDetails;
  orderDate?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  discount?: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'card' | 'wallet';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderStatus?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}
