import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { deleteMember, updateMemberRole } from "@/actions/members";
import { AdminSearch } from "@/components/admin-search";
import { AdminTabs } from "@/components/admin-tabs";
import { DeleteForm } from "@/components/delete-form";
import { prisma } from "@/lib/prisma";
import { StyledSelect } from "@/components/styled-select";

export default async function MemberManagementPage({ searchParams }: { searchParams: Promise<{ memberQuery?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const memberQuery = (await searchParams).memberQuery?.trim() ?? "";
  const users = await prisma.user.findMany({
    where: memberQuery ? { OR: [{ name: { contains: memberQuery, mode: "insensitive" } }, { email: { contains: memberQuery, mode: "insensitive" } }] } : undefined,
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return <div className="page-shell inner-page admin-page content-management-page">
    <div className="admin-subpage-head"><div><p className="eyebrow">CONTROL DESK</p><h1>管理後台</h1><p>管理研究室成員帳號與內容權限。</p></div></div>
    <AdminTabs canManageMembers/>
    <section className="admin-table management-section member-management" aria-labelledby="member-management-title">
      <header><div><p className="eyebrow">MEMBER MANAGEMENT</p><h2 id="member-management-title">成員管理</h2><p className="management-description">管理研究室成員帳號、角色與內容權限。</p></div><div className="admin-section-tools"><small>僅管理員可調整帳號權限</small><AdminSearch action="/admin/members" name="memberQuery" value={memberQuery} placeholder="搜尋姓名或電子信箱"/></div></header>
      <div className="management-column-head member-column-head" aria-hidden="true"><span>成員</span><span>加入日期</span><span>角色</span><span>操作</span></div>
      {users.map(user => <div className="member-admin-row" key={user.id}>
        <div className="member-identity"><b>{user.name}{user.id === session.user.id && <span>目前帳號</span>}</b><small>{user.email}</small></div>
        <time>{user.createdAt.toLocaleDateString("zh-TW")}</time>
        {user.id === session.user.id ? <span className="member-role-current">{user.role}</span> : <form key={`${user.id}-${user.role}`} className="member-role-form" action={updateMemberRole.bind(null, user.id)}><StyledSelect name="role" defaultValue={user.role} ariaLabel={`調整 ${user.name} 的角色`} options={[{ value: "MEMBER", label: "一般成員" }, { value: "EDITOR", label: "內容編輯" }, { value: "ADMIN", label: "管理員" }]}/><button>儲存角色</button></form>}
        {user.id === session.user.id ? <span className="member-self-note">無法刪除</span> : <DeleteForm compact action={deleteMember.bind(null, user.id)} label="刪除成員" confirmMessage={`確定要永久刪除成員「${user.name}」嗎？此操作無法復原。`}/>} 
      </div>)}
      {users.length === 0 && <div className="admin-empty"><b>找不到成員</b><span>{memberQuery ? `沒有符合「${memberQuery}」的成員。` : "目前沒有可管理的成員帳號。"}</span></div>}
    </section>
  </div>;
}
