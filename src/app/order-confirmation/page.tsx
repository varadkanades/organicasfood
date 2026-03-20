import type { Metadata } from "next";
import OrderConfirmation from "./OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function Page() {
  return <OrderConfirmation />;
}
