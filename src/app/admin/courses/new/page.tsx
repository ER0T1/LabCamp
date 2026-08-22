import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCourse } from "@/actions/content";
import { CourseEditorForm } from "@/components/course-editor-form";

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ training?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");
  const [trainings, parentCourses, tags, uploadedAttachments] = await Promise.all([
    prisma.training.findMany({
      orderBy: [{ year: "desc" }, { season: "desc" }],
      select: { id: true, title: true },
    }),
    prisma.course.findMany({
      orderBy: [{ trainingId: "asc" }, { order: "asc" }],
      select: { id: true, title: true, trainingId: true, parentId: true, order: true },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.attachment.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, url: true, type: true, course: { select: { title: true } } },
    }),
  ]);
  const seenUrls = new Set<string>();
  const availableAttachments = uploadedAttachments
    .filter((attachment) => {
      if (seenUrls.has(attachment.url)) return false;
      seenUrls.add(attachment.url);
      return true;
    })
    .map((attachment) => ({ id: attachment.id, name: attachment.name, type: attachment.type, courseTitle: attachment.course.title }));
  const preferred = (await searchParams).training;
  return (
    <div className="editor-page">
      <div className="editor-workspace page-shell">
        <CourseEditorForm
          action={createCourse}
          trainings={trainings}
          parentCourses={parentCourses}
          tagSuggestions={tags.map((tag) => tag.name)}
          availableAttachments={availableAttachments}
          values={{
            trainingId: preferred ?? trainings[0]?.id,
            content: "<h2>這堂課會帶走什麼</h2><p>從這裡開始撰寫課程內容。</p>",
          }}
        />
      </div>
    </div>
  );
}
