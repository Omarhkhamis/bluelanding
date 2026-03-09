import type { ReactNode } from "react";
import "./admin.css";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
