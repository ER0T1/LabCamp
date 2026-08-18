import Link from "next/link";
import { Clock3, ExternalLink, Files, GitCommitHorizontal, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTabs } from "@/components/admin-tabs";
import changelogJson from "@/generated/github-commits.json";

type ChangedFile = {
  path: string;
  status: string;
  additions: number | null;
  deletions: number | null;
};

type Commit = {
  hash: string;
  shortHash: string;
  author: string;
  authoredAt: string;
  subject: string;
  body: string;
  tags: string[];
  additions: number;
  deletions: number;
  files: ChangedFile[];
};

type Changelog = {
  repositoryUrl: string;
  generatedAt: string;
  head: string;
  commits: Commit[];
};

const changelog = changelogJson as unknown as Changelog;
const PAGE_SIZE = 15;
const statusLabels: Record<string, string> = {
  A: "新增", M: "修改", D: "刪除", R: "重新命名", C: "複製", T: "類型變更",
};

function pageHref(query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (page > 1) params.set("page", String(page));
  return `/admin/update-logs${params.size ? `?${params}` : ""}`;
}

function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(value));
}

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");

  const params = await searchParams;
  const query = params.query?.trim().toLocaleLowerCase() ?? "";
  const filtered = query
    ? changelog.commits.filter((commit) => [
      commit.hash,
      commit.subject,
      commit.body,
      commit.author,
      ...commit.tags,
      ...commit.files.map((file) => file.path),
    ].join(" ").toLocaleLowerCase().includes(query))
    : changelog.commits;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);
  const commits = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const contributors = new Set(changelog.commits.map((commit) => commit.author));
  const changedFileRecords = changelog.commits.reduce((sum, commit) => sum + commit.files.length, 0);
  const latest = changelog.commits[0];

  return <div className="page-shell inner-page admin-page changelog-page">
    <div className="admin-subpage-head">
      <div><p className="eyebrow">CONTROL DESK</p><h1>管理後台</h1><p>查看每一次 GitHub 提交包含的功能、修正與檔案變更。</p></div>
    </div>
    <AdminTabs canManageMembers={session.user.role === "ADMIN"}/>

    <div className="stats" aria-label="更新日誌摘要">
      <div><GitCommitHorizontal/><span>提交總數</span><b>{changelog.commits.length}</b><small>完整 Git 歷史</small></div>
      <div><Users/><span>貢獻者</span><b>{contributors.size}</b><small>提交作者</small></div>
      <div><Files/><span>檔案變更</span><b>{changedFileRecords}</b><small>累計變更紀錄</small></div>
      <div><Clock3/><span>最近更新</span><b className="changelog-latest-date">{latest ? formatDate(latest.authoredAt) : "—"}</b><small>最後一次提交</small></div>
    </div>

    <section className="admin-table changelog-management">
      <header>
        <div><p className="eyebrow">GITHUB CHANGELOG</p><h2>更新日誌</h2></div>
        <div className="changelog-header-actions">
          <small>Git 歷史截至 {formatDate(changelog.generatedAt, true)}</small>
          {changelog.repositoryUrl && <a href={changelog.repositoryUrl} target="_blank" rel="noreferrer">開啟 GitHub <ExternalLink size={14}/></a>}
        </div>
      </header>
      <form className="changelog-search" action="/admin/update-logs" method="get">
        <input name="query" defaultValue={params.query} placeholder="搜尋提交訊息、作者、Hash 或檔案路徑" aria-label="搜尋更新日誌"/>
        <button type="submit">搜尋</button>
        {query && <Link href="/admin/update-logs">清除</Link>}
      </form>

      <div className="changelog-list">
        {commits.map((commit) => <article className="changelog-entry" key={commit.hash}>
          <header>
            <div className="commit-identity">
              <span className="commit-dot" aria-hidden="true"/>
              <div>
                <div className="commit-meta">
                  <a href={`${changelog.repositoryUrl}/commit/${commit.hash}`} target="_blank" rel="noreferrer">{commit.shortHash}</a>
                  <span>{formatDate(commit.authoredAt, true)}</span>
                  <span>{commit.author}</span>
                </div>
                <h3>{commit.subject}</h3>
                {commit.body && <p>{commit.body}</p>}
                {commit.tags.length > 0 && <div className="commit-tags">{commit.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
              </div>
            </div>
            <div className="commit-totals"><span>+{commit.additions}</span><span>−{commit.deletions}</span></div>
          </header>
          <details className="commit-files">
            <summary>{commit.files.length > 0 ? `查看 ${commit.files.length} 個變更檔案` : "此合併提交沒有額外檔案差異"}</summary>
            {commit.files.length > 0 && <div>
              {commit.files.map((file, index) => <div className="commit-file" key={`${file.path}-${index}`}>
                <span className={`file-change-status status-${file.status.charAt(0).toLowerCase()}`}>{statusLabels[file.status.charAt(0)] ?? file.status}</span>
                <code>{file.path}</code>
                <span className="file-change-counts">
                  {file.additions === null ? <i>binary</i> : <><b>+{file.additions}</b><em>−{file.deletions}</em></>}
                </span>
              </div>)}
            </div>}
          </details>
        </article>)}
        {commits.length === 0 && <div className="admin-empty">沒有符合條件的提交紀錄</div>}
      </div>

      {totalPages > 1 && <nav className="admin-pagination" aria-label="更新日誌分頁">
        {currentPage > 1 ? <Link href={pageHref(query, currentPage - 1)}>← 上一頁</Link> : <span>← 上一頁</span>}
        <b>第 {currentPage} / {totalPages} 頁</b>
        {currentPage < totalPages ? <Link href={pageHref(query, currentPage + 1)}>下一頁 →</Link> : <span>下一頁 →</span>}
      </nav>}
    </section>
  </div>;
}
