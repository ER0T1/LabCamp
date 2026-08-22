"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./icons";
import type { Session } from "next-auth";

const links = [{ href: "/", label: "首頁" }, { href: "/training", label: "歷屆訓練" }, { href: "/search", label: "內容搜尋" }];

export function Header({ user }: { user?: Session["user"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationLinks = user && user.role !== "MEMBER" ? [...links, { href: "/admin", label: "管理後台" }] : links;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <header className="site-header">
    <div className="site-header-inner">
      <Link className="brand" href="/" prefetch={false} onClick={() => setOpen(false)}>
        <Mark className="brand-mark"/>
        <span>LABCAMP</span>
        <i>實驗室訓練誌</i>
      </Link>
      <nav id="main-navigation" className={open ? "nav open" : "nav"} aria-label="主要導覽">
        {navigationLinks.map((link) => {
          const active = link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return <Link
            key={link.href}
            className={active ? "active" : ""}
            href={link.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
          >{link.label}</Link>;
        })}
        <div className="nav-auth-actions">
          {!user && <Link className="register-link" href="/register" prefetch={false} onClick={() => setOpen(false)}>成員註冊 <span aria-hidden="true">＋</span></Link>}
          <Link className="login-link" href={user ? "/account" : "/login"} prefetch={false} onClick={() => setOpen(false)}>{user ? user.name ?? "成員空間" : "成員登入"} <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>
      <button
        ref={menuButtonRef}
        type="button"
        className="menu-button"
        aria-label={open ? "關閉導覽選單" : "開啟導覽選單"}
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen((current) => !current)}
      >{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</button>
    </div>
  </header>;
}
