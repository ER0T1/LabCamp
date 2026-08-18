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
import { ExistingAttachmentPicker } from "@/components/existing-attachment-picker";
import { CourseAttachmentsPanel } from "@/components/course-attachments-panel";

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
  const [course, trainings, parentCourses, tags, uploadedAttachments] = await Promise.all([
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
      select: { id: true, title: true, trainingId: true, parentId: true, order: true },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.attachment.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true, type: true, course: { select: { title: true } } },
    }),
  ]);
  if (!course) notFound();
  const currentUrls = new Set(course.attachments.map((attachment) => attachment.url));
  const seenUrls = new Set<string>();
  const availableAttachments = uploadedAttachments
    .filter((attachment) => {
      if (currentUrls.has(attachment.url) || seenUrls.has(attachment.url)) return false;
      seenUrls.add(attachment.url);
      return true;
    })
    .map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      courseTitle: attachment.course.title,
    }));
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
      <CourseAttachmentsPanel
        items={course.attachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          href: attachment.url,
          detail: `${attachment.type} · ${attachment.createdAt.toLocaleDateString("zh-TW")}`,
          action: <DeleteForm
            compact
            action={deleteAttachment.bind(null, attachment.id)}
            label="移除"
            confirmMessage={`確定要移除附件「${attachment.name}」嗎？若其他課程仍在使用，原始檔案會保留。`}
          />,
        }))}
        actions={<>
            <AttachmentUploader courseId={course.id} />
            <ExistingAttachmentPicker courseId={course.id} attachments={availableAttachments}/>
        </>}
      />
      {session.user.role === "ADMIN" && (
        <section className="danger-zone">
          <div>
            <p className="eyebrow">DANGER ZONE</p>
            <h2>刪除課程</h2>
            <p>
              刪除後將無法復原；其他課程仍在使用的共用附件檔案會保留。
            </p>
          </div>
          <DeleteForm
            action={deleteCourse.bind(null, course.id)}
            label="刪除這門課程"
            confirmMessage={`確定要永久刪除「${course.title}」嗎？共用附件會保留給其他課程，此操作無法復原。`}
          />
        </section>
      )}
    </div>
  );
}
