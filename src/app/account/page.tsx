import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/actions/auth";
import { ActionButton, ActionLink } from "@/components/action-button";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } });
  return <div className="page-shell inner-page account-page">
    <p className="eyebrow">MEMBER PROFILE</p>
    <div className="account-profile">
      <div className="account-avatar large"><img src={user?.avatarUrl ?? "/default-avatar.svg"} alt={`${session.user.name ?? "使用者"}的頭像`}/></div>
      <div><h1>{session.user.name}</h1><p>{session.user.email}</p><span className="course-tags"><span>{session.user.role}</span></span></div>
    </div>
    <div className="account-actions">
      <ActionLink href="/account/settings" className="settings-button">帳號設定 <span>→</span></ActionLink>
      <form action={logout} suppressHydrationWarning><ActionButton className="logout-button">登出帳號 <span>→</span></ActionButton></form>
    </div>
  </div>;
}
