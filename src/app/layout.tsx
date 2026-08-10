import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { auth } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabCamp — 實驗室訓練誌",
  description: "研究室寒暑訓與知識傳承平台",
  applicationName: "LabCamp",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "LabCamp" },
  icons: { icon: "/icon.svg", apple: "/pwa/icon/180" },
};

export const viewport: Viewport = { themeColor: "#141713", colorScheme: "light" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return <html lang="zh-Hant" data-scroll-behavior="smooth" suppressHydrationWarning><body><Header user={session?.user}/><main>{children}</main><Footer isAuthenticated={Boolean(session?.user)}/><ServiceWorkerRegister/></body></html>;
}
