import Link from "next/link";
import type { AuditLevel, Prisma } from "@prisma/client";
import { CircleX, Info, ListChecks, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTabs } from "@/components/admin-tabs";
import { DateFilterInput } from "@/components/date-filter-input";
import { StyledSelect } from "@/components/styled-select";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const validLevels = new Set<AuditLevel>(["INFO", "WARNING", "ERROR"]);
const levelLabels: Record<AuditLevel, string> = { INFO: "資訊", WARNING: "警告", ERROR: "錯誤" };

type AuditLogParams = { query?: string; level?: string; from?: string; to?: string; page?: string };

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setDate(date.getDate() + 1);
  return date;
}

function pageHref(params: AuditLogParams, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value && key !== "page") search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return `/admin/audit-logs${query ? `?${query}` : ""}`;
}

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<AuditLogParams> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const level = validLevels.has(params.level as AuditLevel) ? params.level as AuditLevel : undefined;
  const from = parseDate(params.from);
  const to = parseDate(params.to, true);
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where: Prisma.AuditLogWhereInput = {
    ...(query ? { OR: [
      { action: { contains: query, mode: "insensitive" } },
      { message: { contains: query, mode: "insensitive" } },
      { actorName: { contains: query, mode: "insensitive" } },
      { actorEmail: { contains: query, mode: "insensitive" } },
      { resourceId: { contains: query, mode: "insensitive" } },
    ] } : {}),
    ...(level ? { level } : {}),
    ...((from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } } : {}),
  };

  const [total, levelCounts] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["level"], _count: { _all: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const countByLevel = new Map(levelCounts.map(item => [item.level, item._count._all]));

  return <div className="page-shell inner-page admin-page">
    <div className="admin-subpage-head"><div><p className="eyebrow">CONTROL DESK</p><h1>管理後台</h1><p>追蹤內容、權限與系統操作事件。</p></div></div>
    <AdminTabs canManageMembers/>

    <div className="stats" aria-label="系統日誌摘要">
      <div><ListChecks/><span>全部日誌</span><b>{levelCounts.reduce((sum, item) => sum + item._count._all, 0)}</b><small>系統操作紀錄</small></div>
      <div><Info/><span>資訊</span><b>{countByLevel.get("INFO") ?? 0}</b><small>一般系統事件</small></div>
      <div><TriangleAlert/><span>警告</span><b>{countByLevel.get("WARNING") ?? 0}</b><small>需要留意</small></div>
      <div><CircleX/><span>錯誤</span><b>{countByLevel.get("ERROR") ?? 0}</b><small>執行異常</small></div>
    </div>

    <section className="admin-table audit-log-management">
      <header><div><p className="eyebrow">SYSTEM AUDIT TRAIL</p><h2>系統日誌</h2></div><small>僅管理員可查看，共 {total} 筆符合條件的紀錄</small></header>
      <form className="login-log-filters" action="/admin/audit-logs" method="get">
        <label>搜尋<input name="query" defaultValue={query} placeholder="操作、訊息、姓名或 Email"/></label>
        <label>等級<StyledSelect name="level" defaultValue={level ?? ""} ariaLabel="等級" options={[{ value: "", label: "全部等級" }, { value: "INFO", label: "資訊" }, { value: "WARNING", label: "警告" }, { value: "ERROR", label: "錯誤" }]}/></label>
        <label>開始日期<DateFilterInput name="from" defaultValue={params.from} ariaLabel="系統日誌開始日期"/></label>
        <label>結束日期<DateFilterInput name="to" defaultValue={params.to} ariaLabel="系統日誌結束日期"/></label>
        <div><button type="submit">套用篩選</button><Link href="/admin/audit-logs">清除</Link></div>
      </form>

      <div className="audit-log-heading" aria-hidden="true"><span>時間</span><span>等級</span><span>事件</span><span>操作者</span><span>詳細資料</span></div>
      {logs.map(log => <div className="audit-log-row" key={log.id}>
        <time dateTime={log.createdAt.toISOString()}>{log.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}</time>
        <span className={`audit-level ${log.level.toLowerCase()}`}>{levelLabels[log.level]}</span>
        <div className="audit-log-event"><b>{log.message}</b><small>{log.action}{log.resourceType ? ` · ${log.resourceType}` : ""}</small></div>
        <div className="audit-log-actor"><b>{log.actorName ?? "系統"}</b><small>{log.actorEmail ?? "—"}</small></div>
        <details><summary>查看</summary><div><b>資源 ID</b><p>{log.resourceId ?? "未提供"}</p><b>附加資料</b><pre>{log.metadata ? JSON.stringify(log.metadata, null, 2) : "無"}</pre></div></details>
      </div>)}
      {logs.length === 0 && <div className="admin-empty">沒有符合條件的系統日誌</div>}

      {totalPages > 1 && <nav className="admin-pagination" aria-label="系統日誌分頁">
        {currentPage > 1 ? <Link href={pageHref(params, currentPage - 1)}>← 上一頁</Link> : <span>← 上一頁</span>}
        <b>第 {currentPage} / {totalPages} 頁</b>
        {currentPage < totalPages ? <Link href={pageHref(params, currentPage + 1)}>下一頁 →</Link> : <span>下一頁 →</span>}
      </nav>}
    </section>
  </div>;
}
