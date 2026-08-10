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
  const [trainings, parentCourses, tags] = await Promise.all([
    prisma.training.findMany({
      orderBy: [{ year: "desc" }, { season: "desc" }],
      select: { id: true, title: true },
    }),
    prisma.course.findMany({
      orderBy: [{ trainingId: "asc" }, { order: "asc" }],
      select: { id: true, title: true, trainingId: true },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  const preferred = (await searchParams).training;
  return (
    <div className="editor-page">
      <CourseEditorForm
        action={createCourse}
        trainings={trainings}
        parentCourses={parentCourses}
        tagSuggestions={tags.map((tag) => tag.name)}
        values={{
          trainingId: preferred ?? trainings[0]?.id,
          content: "<h2>這堂課會帶走什麼</h2><p>從這裡開始撰寫課程內容。</p>",
        }}
      />
    </div>
  );
}
