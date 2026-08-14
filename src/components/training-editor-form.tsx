import Link from "next/link";
import { DateFilterInput } from "@/components/date-filter-input";

type TrainingValues = {
  id?: string; title?: string; year?: number; season?: "WINTER" | "SUMMER";
  description?: string; startDate?: Date; endDate?: Date; published?: boolean;
};

function dateValue(date?: Date) { return date?.toISOString().slice(0, 10) ?? ""; }

export function TrainingEditorForm({ action, values = {}, saved = false }: {
  action: (formData: FormData) => void | Promise<void>;
  values?: TrainingValues;
  saved?: boolean;
}) {
  return <form action={action} className="training-editor-form">
    {values.id && <input type="hidden" name="id" value={values.id}/>}
    <header><div><Link href="/admin">← 管理後台</Link><p className="eyebrow">TRAINING EDITOR</p><h1>{values.id ? "編輯訓練" : "新增訓練"}</h1></div><div>{saved && <span className="saved-badge">已儲存</span>}<label className="publish-check"><input name="published" type="checkbox" defaultChecked={values.published}/> 發布</label><button>{values.id ? "儲存訓練" : "建立訓練"} →</button></div></header>
    <section>
      <label>訓練名稱<input name="title" defaultValue={values.title} required minLength={2}/><small>公開網址會依訓練名稱自動產生</small></label>
      <label>年份<input name="year" type="number" min="2000" max="2100" defaultValue={values.year ?? new Date().getFullYear()} required/></label>
      <label>季節<select name="season" defaultValue={values.season ?? "WINTER"}><option value="WINTER">寒訓</option><option value="SUMMER">暑訓</option></select></label>
      <label>開始日期<DateFilterInput name="startDate" defaultValue={dateValue(values.startDate)} ariaLabel="訓練開始日期" required/></label>
      <label>結束日期<DateFilterInput name="endDate" defaultValue={dateValue(values.endDate)} ariaLabel="訓練結束日期" required/></label>
      <label className="training-description-field">訓練簡介<textarea name="description" defaultValue={values.description} minLength={10} required/></label>
    </section>
  </form>;
}
