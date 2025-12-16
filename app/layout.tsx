import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanban Flow",
  description: "Manage work with a modern kanban board"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
