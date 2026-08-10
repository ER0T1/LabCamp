import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/icons";
import { trainings } from "@/lib/data";
import { findTraining } from "@/lib/repository";

export function generateStaticParams() { return trainings.map(({ slug }) => ({ slug })); }

export default async function TrainingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const training = await findTraining(slug);
  if (!training) notFound();
  return <div className="inner-page"><header className="training-hero page-shell"><div><Link className="breadcrumb" href="/training">訓練檔案庫</Link><span> / {training.year}</span></div><div className="training-title"><div><p className="eyebrow">{training.titleEn}</p><h1>{training.title}</h1></div><p>{training.description}</p></div><div className="training-facts"><span><small>STATUS</small><b className="status"><i/> {training.status}</b></span><span><small>PERIOD</small><b>{training.range}</b></span><span><small>COURSES</small><b>{training.courses.length.toString().padStart(2, "0")}</b></span></div></header>
    <section className="course-catalog page-shell"><div className="catalog-intro"><span className="section-no">01</span><p className="eyebrow">COURSE TREE</p><h2>課程目錄</h2><p>按順序學習，子課程會縮排顯示。</p></div><div className="catalog-list">{training.courses.map((course) => <Link className={`course-depth-${course.depth ?? 0}`} key={course.slug} href={`/training/${training.slug}/courses/${course.slug}`}><span className="mono">{course.index}</span><div><h3>{course.title}</h3><p>{course.description}</p><small>講師　{course.instructor}</small></div><div className="course-tags">{course.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Arrow/></Link>)}</div></section>
  </div>;
}
