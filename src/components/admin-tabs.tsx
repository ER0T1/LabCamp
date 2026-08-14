"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "課程與訓練" },
  { href: "/admin/members", label: "成員管理" },
  { href: "/admin/login-logs", label: "登入日誌" },
  { href: "/admin/audit-logs", label: "系統日誌" },
];

export function AdminTabs({ canManageMembers = false }: { canManageMembers?: boolean }) {
  const pathname = usePathname();
  return <nav className="admin-tabs" aria-label="管理後台分頁">{tabs.filter(tab => tab.href === "/admin" || canManageMembers).map(tab => <Link key={tab.href} href={tab.href} className={pathname === tab.href ? "active" : ""}>{tab.label}</Link>)}</nav>;
}
