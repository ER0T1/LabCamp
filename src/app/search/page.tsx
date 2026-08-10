import Link from "next/link";
import { Arrow } from "@/components/icons";
import { SearchForm } from "@/components/search-form";
import { searchRepository } from "@/lib/repository";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q ?? "";
  const results = await searchRepository(q);
  return <div className="page-shell inner-page search-page"><header className="page-title small"><p className="eyebrow">SEARCH THE ARCHIVE</p><h1>找一段需要的知識。</h1></header><SearchForm initial={q}/>{q && <div className="search-summary"><span>搜尋「{q}」</span><b>{results.length.toString().padStart(2, "0")} RESULTS</b></div>}<div className="search-results">{results.map(({ training, course }) => <Link key={`${training.slug}-${course.slug}`} href={`/training/${training.slug}/courses/${course.slug}`}><div><small>{training.title} / COURSE {course.index}</small><h2>{course.title}</h2><p>{course.description}</p><span>講師　{course.instructor}</span></div><div className="course-tags">{course.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Arrow/></Link>)}{q && results.length === 0 && <div className="empty-state"><b>沒有找到相符內容。</b><p>試試較短的關鍵字，或搜尋「Docker」、「Git」、「GIS」。</p></div>}</div></div>;
}
