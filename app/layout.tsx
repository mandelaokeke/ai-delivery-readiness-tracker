import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MANDAI — Delivery Readiness",
    template: "%s · MANDAI",
  },
  description:
    "An organisation-ready delivery workspace for launch health, risks, milestones, and leadership decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
