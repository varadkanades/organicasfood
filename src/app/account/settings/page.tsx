import type { Metadata } from "next";
import SettingsPage from "./SettingsPage";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default function Page() {
  return <SettingsPage />;
}
