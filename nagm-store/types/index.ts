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

export interface Order {
  id: string;
  orderDate: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vat: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'card' | 'wallet';
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  estimatedDelivery: string;
  trackingNumber: string;
}
