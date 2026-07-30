import { Coupon } from "@/types";

export const coupons: Coupon[] = [
  {
    code: "NEGM10",
    discountType: "percentage",
    value: 10,
    minSubtotal: 0,
    description: "10% discount on your entire order"
  },
  {
    code: "WELCOME15",
    discountType: "percentage",
    value: 15,
    minSubtotal: 1000,
    description: "15% off for orders over 1000 EGP"
  },
  {
    code: "EGYPT50",
    discountType: "fixed",
    value: 50,
    minSubtotal: 500,
    description: "50 EGP instant discount on orders over 500 EGP"
  },
  {
    code: "SUPERAUTO",
    discountType: "fixed",
    value: 200,
    minSubtotal: 2000,
    description: "200 EGP VIP discount on orders over 2000 EGP"
  }
];
