export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  delivery: DeliveryDetails;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  whatsappOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}
