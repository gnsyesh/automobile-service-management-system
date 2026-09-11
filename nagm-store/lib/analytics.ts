import {
  Order,
  OrderStatus,
  DateFilterPreset,
  DateRange,
  PeriodMetrics,
  ComparisonResult,
  UserProfile,
} from "@/types";

/**
 * Normalizes any date value (Firestore Timestamp, ISO string, JS Date, number)
 * into a safe, valid JavaScript Date, or returns null if unparseable.
 */
export function normalizeDate(dateVal: unknown): Date | null {
  if (!dateVal) return null;

  if (typeof dateVal === "object" && dateVal !== null) {
    const obj = dateVal as Record<string, unknown>;
    // 1. Firestore Timestamp instance (has toDate method)
    if (typeof obj.toDate === "function") {
      try {
        const d = (obj.toDate as () => unknown)();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      } catch {}
    }

    // 2. Serialized Firestore Timestamp representation { seconds, nanoseconds }
    if (typeof obj.seconds === "number") {
      const d = new Date(obj.seconds * 1000);
      if (!isNaN(d.getTime())) return d;
    }

    // 3. Native Date instance
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      return dateVal;
    }
  }

  // 4. Numeric epoch milliseconds or seconds
  if (typeof dateVal === "number" && !isNaN(dateVal)) {
    // If timestamp is in seconds (10 digits), convert to ms
    const ms = dateVal < 10000000000 ? dateVal * 1000 : dateVal;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d;
  }

  // 5. String parsing (ISO 8601 or standard date strings)
  if (typeof dateVal === "string") {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;

    // Fallback: parse Arabic or localized date strings if standard parse failed
    const cleaned = dateVal.replace(/[^\d\w\s,:/-]/g, "").trim();
    const fallbackDate = new Date(cleaned);
    if (!isNaN(fallbackDate.getTime())) return fallbackDate;
  }

  return null;
}

/**
 * Extracts the canonical Date representation of an order.
 * Inspects `createdAt`, then `orderDate`, then `updatedAt`.
 */
export function getOrderDate(order: Order): Date | null {
  return (
    normalizeDate(order.createdAt) ||
    normalizeDate(order.orderDate) ||
    normalizeDate(order.updatedAt)
  );
}

/**
 * CANONICAL REVENUE RULE:
 * Revenue is computed from all non-cancelled orders ('Pending', 'Processing', 'Shipped', 'Delivered').
 * Orders with status 'Cancelled' are strictly excluded from gross revenue and average order value.
 */
export function isQualifyingRevenueOrder(order: Order): boolean {
  const s = (order.status || order.orderStatus || "").toLowerCase();
  return s !== "cancelled" && (order.total || 0) > 0;
}

/**
 * Scans orders to extract all distinct calendar years represented in the data.
 * Always returns sorted descending (e.g. [2026, 2025, 2024]).
 */
export function getAvailableYears(orders: Order[]): number[] {
  const years = new Set<number>();
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (d) years.add(d.getFullYear());
  });

  if (years.size === 0) {
    years.add(new Date().getFullYear());
  }

  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Scans orders to extract all distinct year/month combinations present in the data.
 */
export function getAvailableMonths(orders: Order[]): { year: number; month: number }[] {
  const set = new Set<string>();
  const result: { year: number; month: number }[] = [];

  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (d) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!set.has(key)) {
        set.add(key);
        result.push({ year: d.getFullYear(), month: d.getMonth() });
      }
    }
  });

  if (result.length === 0) {
    const now = new Date();
    result.push({ year: now.getFullYear(), month: now.getMonth() });
  }

  return result.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * Computes the DateRange (start and end Date bounds) for any chosen preset,
 * specific year, specific month, or custom date string inputs.
 */
export function getDateRangeForPreset(
  preset: DateFilterPreset,
  specificYear?: number,
  specificMonth?: number,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date();

  switch (preset) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "yesterday": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000 + 86399999);
      return { startDate: start, endDate: end };
    }

    case "last_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
      const start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000 + 86399999);
      return { startDate: start, endDate: end };
    }

    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "last_year": {
      const start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "specific_month": {
      const y = specificYear ?? now.getFullYear();
      const m = specificMonth ?? now.getMonth();
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "specific_year": {
      const y = specificYear ?? now.getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }

    case "custom": {
      const start = customStart ? new Date(`${customStart}T00:00:00`) : null;
      const end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : null;
      return { startDate: start, endDate: end };
    }

    case "all_time":
    default:
      return { startDate: null, endDate: null };
  }
}

/**
 * Filters an array of orders to those whose normalized date falls within the range.
 */
export function filterOrdersByRange(orders: Order[], range: DateRange): Order[] {
  if (!range.startDate && !range.endDate) return orders;

  return orders.filter((o) => {
    const d = getOrderDate(o);
    if (!d) return false;

    if (range.startDate && d < range.startDate) return false;
    if (range.endDate && d > range.endDate) return false;
    return true;
  });
}

/**
 * Computes core business KPIs (Revenue, Orders, AOV, Customers) for a set of orders.
 */
export function calculatePeriodMetrics(orders: Order[]): PeriodMetrics {
  const qualifyingOrders = orders.filter(isQualifyingRevenueOrder);
  const revenue = qualifyingOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const ordersCount = qualifyingOrders.length;
  const averageOrderValue = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;

  const uniqueCustomerIds = new Set<string>();
  orders.forEach((o) => {
    if (o.userId) uniqueCustomerIds.add(o.userId);
    else if (o.userEmail) uniqueCustomerIds.add(o.userEmail);
  });

  return {
    revenue,
    ordersCount,
    averageOrderValue,
    totalCustomers: uniqueCustomerIds.size,
  };
}

/**
 * Calculates comparative performance between two periods (e.g. Current vs Previous).
 */
export function calculateComparison(
  period1Orders: Order[],
  period2Orders: Order[]
): ComparisonResult {
  const p1 = calculatePeriodMetrics(period1Orders);
  const p2 = calculatePeriodMetrics(period2Orders);

  const revenueDiff = p1.revenue - p2.revenue;
  const revenuePct =
    p2.revenue > 0
      ? Math.round(((p1.revenue - p2.revenue) / p2.revenue) * 1000) / 10
      : p1.revenue > 0
      ? 100
      : 0;

  const ordersDiff = p1.ordersCount - p2.ordersCount;
  const ordersPct =
    p2.ordersCount > 0
      ? Math.round(((p1.ordersCount - p2.ordersCount) / p2.ordersCount) * 1000) / 10
      : p1.ordersCount > 0
      ? 100
      : 0;

  const aovDiff = p1.averageOrderValue - p2.averageOrderValue;
  const aovPct =
    p2.averageOrderValue > 0
      ? Math.round(((p1.averageOrderValue - p2.averageOrderValue) / p2.averageOrderValue) * 1000) / 10
      : p1.averageOrderValue > 0
      ? 100
      : 0;

  return {
    period1: p1,
    period2: p2,
    revenueDiff,
    revenuePct,
    ordersDiff,
    ordersPct,
    aovDiff,
    aovPct,
  };
}

/**
 * Aggregates a full 12-month calendar breakdown (Jan to Dec) for a specific year.
 */
export function aggregateMonthlyRevenue(
  orders: Order[],
  year: number
): { monthIndex: number; monthName: string; revenue: number; ordersCount: number }[] {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const series = monthNames.map((name, index) => ({
    monthIndex: index,
    monthName: name,
    revenue: 0,
    ordersCount: 0,
  }));

  orders.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    const d = getOrderDate(o);
    if (d && d.getFullYear() === year) {
      const m = d.getMonth();
      series[m].revenue += o.total || 0;
      series[m].ordersCount += 1;
    }
  });

  return series;
}

/**
 * Aggregates yearly revenue and order counts for all years in the order dataset.
 */
export function aggregateYearlyRevenue(
  orders: Order[]
): { year: number; revenue: number; ordersCount: number }[] {
  const map = new Map<number, { revenue: number; ordersCount: number }>();

  orders.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    const d = getOrderDate(o);
    if (d) {
      const y = d.getFullYear();
      const existing = map.get(y) || { revenue: 0, ordersCount: 0 };
      existing.revenue += o.total || 0;
      existing.ordersCount += 1;
      map.set(y, existing);
    }
  });

  if (map.size === 0) {
    const curYear = new Date().getFullYear();
    map.set(curYear, { revenue: 0, ordersCount: 0 });
  }

  return Array.from(map.entries())
    .map(([year, data]) => ({
      year,
      revenue: data.revenue,
      ordersCount: data.ordersCount,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Aggregates top selling products from actual line items in qualifying orders.
 */
export function aggregateTopSellingProducts(
  orders: Order[],
  limit = 5
): { id: string; name: string; brand: string; quantity: number; revenue: number }[] {
  const productMap = new Map<
    string,
    { id: string; name: string; brand: string; quantity: number; revenue: number }
  >();

  orders.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    if (!Array.isArray(o.items)) return;

    o.items.forEach((item) => {
      const prod = item.product;
      if (!prod) return;

      const pid = prod.id || "unknown";
      const existing = productMap.get(pid) || {
        id: pid,
        name: prod.name || "Unnamed Product",
        brand: prod.brand || "Negm Store",
        quantity: 0,
        revenue: 0,
      };

      const qty = item.quantity || 1;
      existing.quantity += qty;
      existing.revenue += (prod.price || 0) * qty;
      productMap.set(pid, existing);
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/**
 * Aggregates order status distribution across all orders.
 */
export function aggregateOrderStatus(
  orders: Order[]
): { status: OrderStatus; label: string; count: number; percentage: number; color: string }[] {
  const counts: Record<OrderStatus, number> = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  orders.forEach((o) => {
    const s = o.status || o.orderStatus || "Pending";
    if (counts[s as OrderStatus] !== undefined) {
      counts[s as OrderStatus] += 1;
    } else {
      counts.Pending += 1;
    }
  });

  const total = orders.length;

  const statusConfig: { status: OrderStatus; label: string; color: string }[] = [
    { status: "Delivered", label: "Delivered", color: "#10B981" },
    { status: "Processing", label: "Processing", color: "#3B82F6" },
    { status: "Shipped", label: "Shipped", color: "#6366F1" },
    { status: "Pending", label: "Pending", color: "#D4A017" },
    { status: "Cancelled", label: "Cancelled", color: "#EF4444" },
  ];

  return statusConfig.map((cfg) => {
    const count = counts[cfg.status];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      ...cfg,
      count,
      percentage,
    };
  });
}

/**
 * Aggregates revenue and volume per product category.
 */
export function aggregateCategoryPerformance(
  orders: Order[]
): { category: string; revenue: number; unitsSold: number }[] {
  const catMap = new Map<string, { revenue: number; unitsSold: number }>();

  orders.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    if (!Array.isArray(o.items)) return;

    o.items.forEach((item) => {
      const cat = item.product?.category || "accessories";
      const existing = catMap.get(cat) || { revenue: 0, unitsSold: 0 };
      const qty = item.quantity || 1;
      existing.unitsSold += qty;
      existing.revenue += (item.product?.price || 0) * qty;
      catMap.set(cat, existing);
    });
  });

  return Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      unitsSold: data.unitsSold,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculates total physical product units sold in qualifying orders.
 */
export function getPurchasedUnitsCount(orders: Order[]): number {
  let count = 0;
  orders.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    if (!Array.isArray(o.items)) return;
    o.items.forEach((item) => {
      count += item.quantity || 1;
    });
  });
  return count;
}

export interface CustomerInsights {
  totalRegistered: number;
  newCustomersInPeriod: number;
  activeBuyersInPeriod: number;
  repeatCustomersCount: number;
  repeatCustomerRate: number;
  topCustomers: {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    ordersCount: number;
    totalSpent: number;
  }[];
}

/**
 * Analyzes real customer activity and purchase behavior from Firestore users and orders.
 */
export function getCustomerInsights(
  customers: UserProfile[],
  ordersInPeriod: Order[],
  range?: DateRange
): CustomerInsights {
  const totalRegistered = customers.length;

  // 1. New customers registered in selected period
  let newCustomersInPeriod = 0;
  if (range && range.startDate && range.endDate) {
    customers.forEach((c) => {
      const d = normalizeDate(c.createdAt);
      if (d && d >= range.startDate! && d <= range.endDate!) {
        newCustomersInPeriod += 1;
      }
    });
  }

  // 2. Active buyers and repeat rate from orders in period
  const customerOrdersMap = new Map<
    string,
    { ordersCount: number; totalSpent: number; userEmail?: string; customerName?: string }
  >();

  ordersInPeriod.forEach((o) => {
    if (!isQualifyingRevenueOrder(o)) return;
    const key = o.userId || o.userEmail || "anonymous";
    const existing = customerOrdersMap.get(key) || {
      ordersCount: 0,
      totalSpent: 0,
      userEmail: o.userEmail,
      customerName: o.shippingAddress?.fullName,
    };
    existing.ordersCount += 1;
    existing.totalSpent += o.total || 0;
    if (o.shippingAddress?.fullName) existing.customerName = o.shippingAddress.fullName;
    customerOrdersMap.set(key, existing);
  });

  const activeBuyersInPeriod = customerOrdersMap.size;
  let repeatCustomersCount = 0;
  customerOrdersMap.forEach((data) => {
    if (data.ordersCount > 1) {
      repeatCustomersCount += 1;
    }
  });

  const repeatCustomerRate =
    activeBuyersInPeriod > 0
      ? Math.round((repeatCustomersCount / activeBuyersInPeriod) * 100)
      : 0;

  // 3. Top customers ranked by total spend
  // Create quick lookup map for customer profiles
  const profileMap = new Map<string, UserProfile>();
  customers.forEach((c) => {
    if (c.uid) profileMap.set(c.uid, c);
    if (c.email) profileMap.set(c.email.toLowerCase(), c);
  });

  const topCustomers = Array.from(customerOrdersMap.entries())
    .map(([key, data]) => {
      const profile = profileMap.get(key) || (data.userEmail ? profileMap.get(data.userEmail.toLowerCase()) : undefined);
      return {
        uid: profile?.uid || key,
        name: profile?.name || data.customerName || profile?.email?.split("@")[0] || "Customer",
        email: profile?.email || data.userEmail || "",
        phone: profile?.phone || "",
        ordersCount: data.ordersCount,
        totalSpent: data.totalSpent,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    totalRegistered,
    newCustomersInPeriod,
    activeBuyersInPeriod,
    repeatCustomersCount,
    repeatCustomerRate,
    topCustomers,
  };
}
