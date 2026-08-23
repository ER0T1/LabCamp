import { TrainingCard } from "@/components/training-card";
import { listTrainings } from "@/lib/repository";

export default async function TrainingArchive() {
  const trainings = await listTrainings();
  const years = [...new Set(trainings.map((item) => item.year))];
  return <div className="page-shell inner-page training-archive-page"><header className="page-title"><p className="eyebrow">THE ARCHIVE / 訓練檔案庫</p><h1>每一屆，都是<br/><em>下一屆的起點。</em></h1><p>寒訓、暑訓與一路累積下來的方法。依年份翻閱，找到你需要的技術脈絡。</p></header>
    <div className="archive-years">{years.map((year) => <section key={year} className="year-group"><div className="year-label"><span>{year}</span><i/></div><div className="archive-cards two">{trainings.filter(t => t.year === year).map(t => <TrainingCard training={t} key={t.slug}/>)}</div></section>)}{trainings.length === 0 && <div className="data-empty"><b>沒有資料</b><p>目前尚未建立任何訓練。</p></div>}</div>
  </div>;
}
