import Link from "next/link";
import { Arrow } from "@/components/icons";
import { TrainingCard } from "@/components/training-card";
import { listTrainings } from "@/lib/repository";

export default async function Home() {
  const trainings = await listTrainings();
  const currentTraining = trainings[0];
  const latestCourses = trainings.flatMap(training => training.courses.map(course => ({ training, course }))).sort((a, b) => b.course.updatedAt.localeCompare(a.course.updatedAt)).slice(0, 4);
  return <div className="home-page">
    <section className="hero page-shell">
      <div className="hero-index mono">RESEARCH LOG / 001</div>
      <div className="hero-copy"><p className="eyebrow">研究室寒暑訓與知識傳承平台</p><h1>把走過的路，<br/><em>留給下一個人。</em></h1><p className="hero-note">保存每一屆訓練的教材、方法與討論。<br/>知識不該在成員離開後，重新歸零。</p><Link className="text-link" href="/training">開始探索訓練紀錄 <Arrow/></Link></div>
      <div className="hero-orbit" aria-hidden="true"><span>CEITL</span><div className="orbit-line one"/><div className="orbit-line two"/><i className="dot d1"/><i className="dot d2"/></div>
      <div className="scroll-note mono">SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <section className="section page-shell"><div className="section-head"><div><span className="section-no">01</span><p className="eyebrow">CURRENT SESSION</p><h2>本期訓練</h2></div><p>從工具到方法，建立共同語言。<br/>今年夏天，我們一起把基礎打深。</p></div>{currentTraining ? <div className="featured-grid"><TrainingCard training={currentTraining} featured/><div className="side-note"><span className="vertical mono">FIELD NOTE · {currentTraining.year}</span><p>每一份教材都來自真實踩過的坑。<br/>不只告訴你怎麼做，也保留我們為什麼這樣做。</p></div></div> : <div className="data-empty"><b>沒有資料</b><p>目前尚未建立任何訓練。</p></div>}</section>

    <section className="section latest-section"><div className="page-shell"><div className="section-head compact"><div><span className="section-no">02</span><p className="eyebrow">RECENTLY UPDATED</p><h2>最近更新</h2></div><Link className="plain-link" href="/search">內容搜尋 ↗</Link></div><div className="course-list">{latestCourses.map(({ training, course }) => <Link href={`/training/${training.slug}/courses/${course.slug}`} className="course-row" key={`${training.slug}-${course.slug}`}><span className="course-index mono">{course.index}</span><div><h3>{course.title}</h3><p>{course.description}</p></div><div className="course-tags">{[...course.tags].sort((a, b) => a.localeCompare(b, "zh-Hant", { numeric: true, sensitivity: "base" })).map(tag => <span key={tag}>{tag}</span>)}</div><span className="course-date mono">UPDATED<br/>{course.updatedAt}</span><Arrow aria-hidden="true"/></Link>)}{latestCourses.length === 0 && <div className="data-empty dark"><b>沒有資料</b><p>目前尚未建立任何課程。</p></div>}</div></div></section>

    <section className="section page-shell archive-preview"><div className="section-head compact"><div><span className="section-no">03</span><p className="eyebrow">THE ARCHIVE</p><h2>歷屆訓練</h2></div><p>每個學期都是一個版本。<br/>往回翻，看看我們如何走到這裡。</p></div>{trainings.length > 0 ? <><div className="archive-cards">{trainings.slice(0, 3).map(t => <TrainingCard training={t} key={t.slug}/>)}</div><Link className="outline-button" href="/training">開啟完整訓練檔案庫 <Arrow/></Link></> : <div className="data-empty"><b>沒有資料</b><p>訓練檔案庫目前是空的。</p></div>}</section>
  </div>;
}
