import Link from "next/link";
import { Arrow } from "@/components/icons";
import { SearchForm } from "@/components/search-form";
import { searchRepository } from "@/lib/repository";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const results = await searchRepository(q);
  return <div className="page-shell inner-page search-page">
    <header className="search-page-header">
      <p className="eyebrow">SEARCH THE ARCHIVE</p>
      <h1>找一段需要的知識。</h1>
      <p>搜尋歷屆課程名稱、講師與標籤，快速回到需要的教材。</p>
    </header>
    <SearchForm initial={q}/>
    {q ? <section className="search-result-section" aria-labelledby="search-result-title">
      <header className="search-summary"><span id="search-result-title">搜尋「{q}」</span><b>{results.length.toString().padStart(2, "0")} RESULTS</b></header>
      <div className="search-results">{results.map(({ training, course }) => <Link key={`${training.slug}-${course.slug}`} href={`/training/${training.slug}/courses/${course.slug}`}>
        <div className="search-result-copy"><small>{training.title} / COURSE {course.index}</small><h2>{course.title}</h2><p>{course.description}</p><span>講師　{course.instructor || "未設定"}</span></div>
        <div className="course-tags" aria-label="課程標籤">{course.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <Arrow aria-hidden="true"/>
      </Link>)}{results.length === 0 && <div className="empty-state"><b>沒有找到相符內容。</b><p>試試較短的關鍵字，或搜尋「Docker」、「Git」、「GIS」。</p></div>}</div>
    </section> : <div className="search-idle"><p className="eyebrow">SEARCH SCOPE</p><b>從課程檔案開始搜尋</b><p>可輸入課程名稱、講師姓名或技術標籤。</p></div>}
  </div>;
}
