export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  is_active: boolean;
  unlimited_use: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string | null;
  used_at: string;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
}

export interface CouponInput {
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  is_active?: boolean;
  unlimited_use?: boolean;
}
