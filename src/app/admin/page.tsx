import Link from "next/link";
import { BookOpen, Clock3, FileText, Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { deleteCourse, deleteTraining } from "@/actions/content";
import { ActionLink } from "@/components/action-button";
import { AdminSearch } from "@/components/admin-search";
import { AdminTabs } from "@/components/admin-tabs";
import { DeleteForm } from "@/components/delete-form";
import { prisma } from "@/lib/prisma";

const tagNameCollator = new Intl.Collator("zh-Hant", { numeric: true, sensitivity: "base" });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ courseQuery?: string; trainingQuery?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");
  const params = await searchParams;
  const courseQuery = params.courseQuery?.trim() ?? "";
  const trainingQuery = params.trainingQuery?.trim() ?? "";

  const [courses, userCount, draftCount, totalCourseCount, dbTrainings, totalTrainingCount, defaultTraining] = await Promise.all([
    prisma.course.findMany({ where: courseQuery ? { OR: [{ title: { contains: courseQuery, mode: "insensitive" } }, { description: { contains: courseQuery, mode: "insensitive" } }, { instructor: { contains: courseQuery, mode: "insensitive" } }, { tags: { some: { tag: { name: { contains: courseQuery, mode: "insensitive" } } } } }] } : undefined, orderBy: { updatedAt: "desc" }, include: { training: true, tags: { include: { tag: true } } } }),
    prisma.user.count(),
    prisma.course.count({ where: { published: false } }),
    prisma.course.count(),
    prisma.training.findMany({ where: trainingQuery ? { OR: [{ title: { contains: trainingQuery, mode: "insensitive" } }, { description: { contains: trainingQuery, mode: "insensitive" } }] } : undefined, include: { _count: { select: { courses: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.training.count(),
    prisma.training.findFirst({ orderBy: [{ year: "desc" }, { season: "desc" }], select: { id: true } }),
  ]);
  return <div className="page-shell inner-page admin-page content-management-page">
    <div className="admin-head">
      <div><p className="eyebrow">CONTROL DESK</p><h1>管理後台</h1><p>午安，{session.user.name}。今天要整理哪一段知識？</p></div>
      <div className="admin-actions">
        <ActionLink href={`/admin/courses/new${defaultTraining ? `?training=${defaultTraining.id}` : ""}`}><Plus size={16}/> 新增課程</ActionLink>
        <ActionLink href="/admin/trainings/new"><Plus size={16}/> 新增訓練</ActionLink>
      </div>
    </div>

    <AdminTabs canManageMembers={session.user.role === "ADMIN"}/>

    <div className="stats">
      <div><BookOpen/><span>訓練總數</span><b>{totalTrainingCount}</b><small>資料庫內容</small></div>
      <div><FileText/><span>課程總數</span><b>{totalCourseCount}</b><small>資料庫內容</small></div>
      <div><Users/><span>成員人數</span><b>{userCount}</b><small>具登入帳號</small></div>
      <div><Clock3/><span>待發布</span><b>{draftCount}</b><small>草稿內容</small></div>
    </div>

    <section className="admin-table management-section course-management" aria-labelledby="course-management-title">
      <header><div><p className="eyebrow">COURSE MANAGEMENT</p><h2 id="course-management-title">課程管理</h2><p className="management-description">編輯課程內容、講師、標籤與發布狀態。</p></div><div className="admin-section-tools"><Link className="management-public-link" href="/training">查看公開頁面 ↗</Link><AdminSearch action="/admin" name="courseQuery" value={courseQuery} placeholder="搜尋課程、講師或標籤"/></div></header>
      <div className="management-column-head course-column-head" aria-hidden="true"><span>檔案</span><span>課程</span><span>狀態</span><span>標籤</span><span>更新日期</span><span>操作</span></div>
      {courses.map(course => <div className="admin-row management-row course-management-row" key={course.id}>
        <span className="file-icon" aria-hidden="true">TXT</span>
        <div className="management-identity"><Link href={`/admin/courses/${course.id}/edit`}><b>{course.title}</b></Link><small>{course.training.title} · {course.instructor || "未設定講師"}</small></div>
        <span className={course.published ? "publish-state live" : "publish-state"}>{course.published ? "已發布" : "草稿"}</span>
        <div className="course-tags admin-course-tags" aria-label="課程標籤">{[...course.tags].sort((a, b) => tagNameCollator.compare(a.tag.name, b.tag.name)).map(item => <span key={item.tagId}>{item.tag.name}</span>)}{course.tags.length === 0 && <span>UNTAGGED</span>}</div>
        <time dateTime={course.updatedAt.toISOString()}><span>更新</span>{course.updatedAt.toLocaleDateString("zh-TW")}</time>
        <div className="course-row-actions"><Link className="admin-row-action" href={`/admin/courses/${course.id}/edit`}>編輯課程</Link>{session.user.role === "ADMIN" && <DeleteForm compact action={deleteCourse.bind(null, course.id)} label="刪除課程" confirmMessage={`確定要永久刪除「${course.title}」嗎？共用附件會保留給其他課程，其餘內容無法復原。`}/>}</div>
      </div>)}{courses.length === 0 && <div className="admin-empty"><b>找不到課程</b><span>{courseQuery ? `沒有符合「${courseQuery}」的課程。` : "目前尚未建立任何課程。"}</span></div>}
    </section>

    {session.user.role === "ADMIN" && <section className="admin-table management-section training-management" aria-labelledby="training-management-title">
      <header><div><p className="eyebrow">TRAINING MANAGEMENT</p><h2 id="training-management-title">訓練管理</h2><p className="management-description">管理訓練梯次、期間與所屬課程。</p></div><div className="admin-section-tools"><small>注意：刪除訓練會一併刪除所屬課程</small><AdminSearch action="/admin" name="trainingQuery" value={trainingQuery} placeholder="搜尋訓練名稱或簡介"/></div></header>
      <div className="management-column-head training-column-head" aria-hidden="true"><span>訓練</span><span>狀態</span><span>操作</span></div>
      {dbTrainings.map(training => <div className="training-admin-row management-row" key={training.id}>
        <div className="management-identity"><Link href={`/admin/trainings/${training.id}/edit`}><b>{training.title}</b></Link><small>{training.year} · {training.season === "SUMMER" ? "暑訓" : "寒訓"} · {training._count.courses} 門課程</small></div>
        <span className={training.published ? "publish-state live" : "publish-state"}>{training.published ? "已發布" : "草稿"}</span>
        <div className="training-row-actions"><Link className="training-edit-link" href={`/admin/trainings/${training.id}/edit`}>編輯訓練</Link><DeleteForm compact action={deleteTraining.bind(null, training.id)} label="刪除訓練" confirmMessage={`確定要永久刪除「${training.title}」及其 ${training._count.courses} 門課程嗎？此操作無法復原。`}/></div>
      </div>)}{dbTrainings.length === 0 && <div className="admin-empty"><b>找不到訓練</b><span>{trainingQuery ? `沒有符合「${trainingQuery}」的訓練。` : "目前尚未建立任何訓練。"}</span></div>}
    </section>}

  </div>;
}
