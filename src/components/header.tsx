"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Mark } from "./icons";
import type { Session } from "next-auth";

const links = [{ href: "/", label: "首頁" }, { href: "/training", label: "歷屆訓練" }, { href: "/search", label: "內容搜尋" }];

export function Header({ user }: { user?: Session["user"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigationLinks = user && user.role !== "MEMBER" ? [...links, { href: "/admin", label: "管理後台" }] : links;
  return <header className="site-header">
    <Link className="brand" href="/" prefetch={false} onClick={() => setOpen(false)}><Mark className="brand-mark"/><span>LABCAMP</span><i>實驗室訓練誌</i></Link>
    <nav className={open ? "nav open" : "nav"}>
      {navigationLinks.map((link) => <Link key={link.href} className={pathname === link.href || (link.href === "/admin" && pathname.startsWith("/admin/")) ? "active" : ""} href={link.href} prefetch={false} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <div className="nav-auth-actions">
        {!user && <Link className="register-link" href="/register" prefetch={false} onClick={() => setOpen(false)}>成員註冊 <span>＋</span></Link>}
        <Link className="login-link" href={user ? "/account" : "/login"} prefetch={false} onClick={() => setOpen(false)}>{user ? user.name ?? "成員空間" : "成員登入"} <span>↗</span></Link>
      </div>
    </nav>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="開啟選單">{open ? <X/> : <Menu/>}</button>
  </header>;
}
