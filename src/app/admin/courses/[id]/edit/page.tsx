import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteAttachment,
  deleteCourse,
  updateCourse,
} from "@/actions/content";
import { CourseEditorForm } from "@/components/course-editor-form";
import { toEditorHtml } from "@/lib/content";
import { DeleteForm } from "@/components/delete-form";
import { AttachmentUploader } from "@/components/attachment-uploader";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");
  const { id } = await params;
  const [course, trainings, parentCourses, tags] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        attachments: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.training.findMany({
      orderBy: [{ year: "desc" }, { season: "desc" }],
      select: { id: true, title: true },
    }),
    prisma.course.findMany({
      where: { id: { not: id } },
      orderBy: { order: "asc" },
      select: { id: true, title: true, trainingId: true },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (!course) notFound();
  return (
    <div className="editor-page">
      <CourseEditorForm
        action={updateCourse}
        trainings={trainings}
        parentCourses={parentCourses}
        tagSuggestions={tags.map((tag) => tag.name)}
        saved={(await searchParams).saved === "1"}
        values={{
          ...course,
          content: await toEditorHtml(course.content),
          tags: course.tags.map((item) => item.tag.name).join(", "),
        }}
      />
      <section className="attachment-panel">
        <header>
          <div>
            <p className="eyebrow">COURSE FILES</p>
            <h2>課程附件</h2>
            <p>圖片可直接拖曳至編輯器；PDF、壓縮檔與程式碼請由這裡上傳。</p>
          </div>
          <AttachmentUploader courseId={course.id} />
        </header>
        <div className="attachment-list">
          {course.attachments.map((attachment) => (
            <div key={attachment.id}>
              <span className="file-icon">
                {attachment.type.startsWith("image") ? "IMG" : "FILE"}
              </span>
              <div>
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  {attachment.name}
                </a>
                <small>
                  {attachment.type} ·{" "}
                  {attachment.createdAt.toLocaleDateString("zh-TW")}
                </small>
              </div>
              <DeleteForm
                compact
                action={deleteAttachment.bind(null, attachment.id)}
                label="移除"
                confirmMessage={`確定要刪除附件「${attachment.name}」嗎？`}
              />
            </div>
          ))}
          {course.attachments.length === 0 && (
            <p className="empty-attachments">目前沒有獨立附件。</p>
          )}
        </div>
      </section>
      {session.user.role === "ADMIN" && (
        <section className="danger-zone">
          <div>
            <p className="eyebrow">DANGER ZONE</p>
            <h2>刪除課程</h2>
            <p>
              刪除後將無法復原，課程教材、標籤關聯、附件與相關連結都會一併移除。
            </p>
          </div>
          <DeleteForm
            action={deleteCourse.bind(null, course.id)}
            label="刪除這門課程"
            confirmMessage={`確定要永久刪除「${course.title}」嗎？此操作無法復原。`}
          />
        </section>
      )}
    </div>
  );
}
