import Link from "next/link";
import type { Training } from "@/lib/data";
import { Arrow } from "./icons";

export function TrainingCard({ training, featured = false }: { training: Training; featured?: boolean }) {
  return <Link href={`/training/${training.slug}`} className={featured ? "training-card featured" : "training-card"}>
    <div className="card-top"><span className="status"><i/> {training.status}</span><span className="mono">{training.titleEn}</span></div>
    <div className="card-main"><div><span className="card-season">{training.season === "夏季" ? "SUMMER" : "WINTER"}</span><h3>{training.title}</h3><p>{training.description}</p></div><Arrow className="card-arrow" aria-hidden="true"/></div>
    <div className="card-meta"><span><b>{training.courses.length.toString().padStart(2, "0")}</b> 門課程</span><span><b>{training.range}</b> 訓練期間</span></div>
  </Link>;
}
