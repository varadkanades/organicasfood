import type { Metadata } from "next";
import AddressesPage from "./AddressesPage";

export const metadata: Metadata = {
  title: "Saved Addresses",
};

export default function Page() {
  return <AddressesPage />;
}
