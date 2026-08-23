import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseNav } from "@/components/course-nav";
import { trainings } from "@/lib/data";
import { decodeSlug, findTraining } from "@/lib/repository";
import { buildDocumentOutline, toSafeHtml } from "@/lib/content";
import { TableOfContents } from "@/components/table-of-contents";

export function generateStaticParams() { return trainings.flatMap(t => t.courses.map(c => ({ slug: t.slug, courseSlug: c.slug }))); }

export default async function CoursePage({ params }: { params: Promise<{ slug: string; courseSlug: string }> }) {
  const { slug, courseSlug } = await params;
  const training = await findTraining(slug);
  const decodedCourseSlug = decodeSlug(courseSlug);
  const course = training?.courses.find(c => c.slug === decodedCourseSlug);
  if (!training || !course) notFound();
  const currentIndex = training.courses.findIndex(c => c.slug === course.slug);
  const next = training.courses[currentIndex + 1];
  const document = buildDocumentOutline(await toSafeHtml(course.content));
  return <div className="doc-layout course-document-page"><CourseNav training={training} current={course.slug}/><article className="doc-content"><header><p className="eyebrow">{training.title} / COURSE {course.index}</p><h1>{course.title}</h1><p>{course.description}</p><div className="doc-meta"><span><small>INSTRUCTOR</small>{course.instructor || "未設定"}</span><span><small>UPDATED</small>{course.updatedAt}</span></div></header><div className="markdown" dangerouslySetInnerHTML={{ __html: document.content }}/>{course.attachments.length > 0 && <section className="course-downloads"><p className="eyebrow">COURSE FILES</p><h2>附件下載</h2>{course.attachments.map(attachment => <a href={attachment.url} key={attachment.url}><span>{attachment.type.startsWith("image") ? "IMG" : "FILE"}</span><b>{attachment.name}</b><i>下載 ↓</i></a>)}</section>}{next && <Link className="next-course" href={`/training/${training.slug}/courses/${next.slug}`}><span>NEXT COURSE / {next.index}</span><b>{next.title} →</b></Link>}</article><TableOfContents headings={document.headings}/></div>;
}
