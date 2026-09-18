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
  price?: number;
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
  newCustomerOnly?: boolean;
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

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DateFilterPreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "specific_month"
  | "specific_year"
  | "custom"
  | "all_time";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface PeriodMetrics {
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  totalCustomers: number;
}

export interface ComparisonResult {
  period1: PeriodMetrics;
  period2: PeriodMetrics;
  revenueDiff: number;
  revenuePct: number;
  ordersDiff: number;
  ordersPct: number;
  aovDiff: number;
  aovPct: number;
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
  paymentMethod: 'cod' | 'card';
  paymentStatus?: PaymentStatus;
  paymentTransactionId?: string;
  paymentReference?: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  estimatedDelivery?: string;
  couponCode?: string | null;
  notes?: string;
  stockDecremented?: boolean;
  salesRecorded?: boolean;
  expiresAt?: string;
  feedbackSubmitted?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderFeedback {
  orderId: string;
  userId: string;
  userEmail?: string;
  rating: number; // 1-5 overall customer experience satisfaction
  comment?: string;
  createdAt: string;
}

export interface ProductSales {
  productId: string;
  unitsSold: number;
  revenue: number;
  updatedAt: string;
}

export interface ProcessedSalesOrder {
  orderId: string;
  processedAt: string;
  status: OrderStatus;
  cancelled?: boolean;
  cancelledAt?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}
