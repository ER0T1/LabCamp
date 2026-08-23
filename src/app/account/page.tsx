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
    <header className="account-page-header">
      <p className="eyebrow">MEMBER PROFILE</p>
      <h1>個人帳號</h1>
      <p>查看目前登入身分，或前往設定更新帳號資料。</p>
    </header>
    <section className="account-profile" aria-labelledby="account-profile-name">
      <div className="account-avatar large"><img src={user?.avatarUrl ?? "/default-avatar.svg"} alt={`${session.user.name ?? "使用者"}的頭像`}/></div>
      <div className="account-profile-details"><p className="eyebrow">SIGNED-IN MEMBER</p><h2 id="account-profile-name">{session.user.name}</h2><dl><div><dt>電子信箱</dt><dd>{session.user.email}</dd></div><div><dt>帳號角色</dt><dd><span className="account-role">{session.user.role}</span></dd></div></dl></div>
    </section>
    <div className="account-actions">
      <ActionLink href="/account/settings" className="settings-button">帳號設定 <span>→</span></ActionLink>
      <form action={logout} suppressHydrationWarning><ActionButton className="logout-button">登出帳號 <span>→</span></ActionButton></form>
    </div>
  </div>;
}
