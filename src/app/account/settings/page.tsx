import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EmailSettingsForm, PasswordSettingsForm } from "@/components/account-settings-form";
import { AvatarSettingsForm } from "@/components/avatar-settings-form";
import { prisma } from "@/lib/prisma";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } });

  return <div className="page-shell inner-page account-settings-page">
    <Link className="account-back-link" href="/account">← 返回個人頁面</Link>
    <header>
      <p className="eyebrow">ACCOUNT SETTINGS</p>
      <h1>帳號設定</h1>
      <p>管理個人頭像、登入電子信箱與密碼。</p>
    </header>
    <AvatarSettingsForm avatarUrl={user?.avatarUrl ?? null} name={session.user.name ?? "使用者"}/>
    <section className="account-settings" aria-label="登入資料設定">
      <div><EmailSettingsForm email={session.user.email ?? ""}/><PasswordSettingsForm/></div>
    </section>
  </div>;
}
