import Link from "next/link";
import type { LoginEvent, Prisma } from "@prisma/client";
import { ListChecks, LogIn, LogOut, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTabs } from "@/components/admin-tabs";
import { DateFilterInput } from "@/components/date-filter-input";
import { StyledSelect } from "@/components/styled-select";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const validEvents = new Set<LoginEvent>(["LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT"]);
const eventLabels: Record<LoginEvent, string> = {
  LOGIN_SUCCESS: "登入成功",
  LOGIN_FAILED: "登入失敗",
  LOGOUT: "登出",
};
const reasonLabels: Record<string, string> = {
  INVALID_INPUT: "輸入格式無效",
  USER_NOT_FOUND: "帳號不存在",
  INVALID_PASSWORD: "密碼錯誤",
  ACCOUNT_DISABLED: "帳號已停用",
  RATE_LIMITED: "嘗試次數過多",
};

type LoginLogParams = {
  query?: string;
  event?: string;
  from?: string;
  to?: string;
  page?: string;
};

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setDate(date.getDate() + 1);
  return date;
}

function pageHref(params: LoginLogParams, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return `/admin/login-logs${query ? `?${query}` : ""}`;
}

export default async function LoginLogsPage({ searchParams }: { searchParams: Promise<LoginLogParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const event = validEvents.has(params.event as LoginEvent) ? params.event as LoginEvent : undefined;
  const from = parseDate(params.from);
  const to = parseDate(params.to, true);
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.LoginLogWhereInput = {
    ...(query ? { OR: [
      { email: { contains: query, mode: "insensitive" } },
      { user: { name: { contains: query, mode: "insensitive" } } },
      { ipAddress: { contains: query, mode: "insensitive" } },
    ] } : {}),
    ...(event ? { event } : {}),
    ...((from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } } : {}),
  };

  const [total, eventCounts, recentFailures] = await Promise.all([
    prisma.loginLog.count({ where }),
    prisma.loginLog.groupBy({ by: ["event"], _count: { _all: true } }),
    prisma.loginLog.findMany({
      where: { event: "LOGIN_FAILED", createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, ipAddress: { not: null } },
      select: { ipAddress: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const logs = await prisma.loginLog.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const countByEvent = new Map(eventCounts.map(item => [item.event, item._count._all]));
  const failureCountByIp = new Map<string, number>();
  for (const item of recentFailures) {
    if (item.ipAddress) failureCountByIp.set(item.ipAddress, (failureCountByIp.get(item.ipAddress) ?? 0) + 1);
  }
  const suspiciousIps = new Set([...failureCountByIp].filter(([, count]) => count >= 5).map(([ip]) => ip));

  return <div className="page-shell inner-page admin-page">
    <div className="admin-subpage-head"><div><p className="eyebrow">CONTROL DESK</p><h1>管理後台</h1><p>查看登入、失敗嘗試與登出紀錄。</p></div></div>
    <AdminTabs canManageMembers/>

    <div className="stats" aria-label="登入日誌摘要">
      <div><ListChecks/><span>全部事件</span><b>{eventCounts.reduce((sum, item) => sum + item._count._all, 0)}</b><small>符合目前篩選</small></div>
      <div><LogIn/><span>登入成功</span><b>{countByEvent.get("LOGIN_SUCCESS") ?? 0}</b><small>驗證通過</small></div>
      <div><ShieldAlert/><span>登入失敗</span><b>{countByEvent.get("LOGIN_FAILED") ?? 0}</b><small>驗證未通過</small></div>
      <div><LogOut/><span>登出</span><b>{countByEvent.get("LOGOUT") ?? 0}</b><small>工作階段結束</small></div>
    </div>

    <section className="admin-table login-log-management">
      <header><div><p className="eyebrow">AUTHENTICATION AUDIT</p><h2>登入日誌</h2></div><small>僅管理員可查看，共 {total} 筆符合條件的紀錄</small></header>
      <form className="login-log-filters" action="/admin/login-logs" method="get">
        <label>搜尋<input name="query" defaultValue={query} placeholder="Email、姓名或 IP"/></label>
        <label>事件<StyledSelect name="event" defaultValue={event ?? ""} ariaLabel="事件" options={[{ value: "", label: "全部事件" }, { value: "LOGIN_SUCCESS", label: "登入成功" }, { value: "LOGIN_FAILED", label: "登入失敗" }, { value: "LOGOUT", label: "登出" }]}/></label>
        <label>開始日期<DateFilterInput name="from" defaultValue={params.from} ariaLabel="登入日誌開始日期"/></label>
        <label>結束日期<DateFilterInput name="to" defaultValue={params.to} ariaLabel="登入日誌結束日期"/></label>
        <div><button type="submit">套用篩選</button><Link href="/admin/login-logs">清除</Link></div>
      </form>

      <div className="login-log-heading" aria-hidden="true"><span>時間</span><span>使用者</span><span>事件</span><span>IP 位址</span><span>詳細資料</span></div>
      {logs.map(log => {
        const suspicious = Boolean(log.ipAddress && suspiciousIps.has(log.ipAddress));
        return <div className="login-log-row" key={log.id}>
          <time dateTime={log.createdAt.toISOString()}>{log.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}</time>
          <div className="login-log-user"><b>{log.user?.name ?? "未知使用者"}</b><small>{log.email ?? "未提供 Email"}</small></div>
          <span className={`login-event ${log.event.toLowerCase()}`}>{eventLabels[log.event]}</span>
          <div className="login-log-ip"><code>{log.ipAddress ?? "—"}</code>{suspicious && <strong>⚠ 疑似暴力破解</strong>}</div>
          <details><summary>查看</summary><div><b>瀏覽器／裝置</b><p>{log.userAgent ?? "未提供"}</p>{log.failureReason && <><b>失敗原因</b><p>{reasonLabels[log.failureReason] ?? log.failureReason}</p></>}</div></details>
        </div>;
      })}
      {logs.length === 0 && <div className="admin-empty">沒有符合條件的登入日誌</div>}

      {totalPages > 1 && <nav className="admin-pagination" aria-label="登入日誌分頁">
        {currentPage > 1 ? <Link href={pageHref(params, currentPage - 1)}>← 上一頁</Link> : <span>← 上一頁</span>}
        <b>第 {currentPage} / {totalPages} 頁</b>
        {currentPage < totalPages ? <Link href={pageHref(params, currentPage + 1)}>下一頁 →</Link> : <span>下一頁 →</span>}
      </nav>}
    </section>
  </div>;
}
