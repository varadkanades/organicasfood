import type { Metadata } from "next";
import OrdersPage from "./OrdersPage";

export const metadata: Metadata = {
  title: "My Orders | Organikas Foods",
  description: "View your order history and track your orders.",
};

export default function Page() {
  return <OrdersPage />;
}
