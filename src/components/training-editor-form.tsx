import Link from "next/link";
import { DateFilterInput } from "@/components/date-filter-input";
import { StyledSelect } from "@/components/styled-select";

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
    <header className="training-editor-bar"><div><Link href="/admin">← 管理後台</Link><p className="eyebrow">TRAINING EDITOR</p><h1>{values.id ? "編輯訓練" : "新增訓練"}</h1></div><div className="training-editor-actions">{saved && <span className="saved-badge" role="status">已儲存</span>}<label className="publish-check publication-switch"><input name="published" type="checkbox" defaultChecked={values.published}/> 發布</label><button type="submit" className="training-save-button">{values.id ? "儲存訓練" : "建立訓練"} →</button></div></header>
    <section className="training-fields-panel">
      <label className="training-field-title">訓練名稱<input name="title" defaultValue={values.title} required minLength={2}/><small>公開網址會依訓練名稱自動產生</small></label>
      <label className="training-field-year">年份<input name="year" type="number" min="2000" max="2100" defaultValue={values.year ?? new Date().getFullYear()} required/></label>
      <label className="training-field-season">季節<StyledSelect name="season" defaultValue={values.season ?? "WINTER"} ariaLabel="季節" options={[{ value: "WINTER", label: "寒訓" }, { value: "SUMMER", label: "暑訓" }]}/></label>
      <label className="training-field-start">開始日期<DateFilterInput name="startDate" defaultValue={dateValue(values.startDate)} ariaLabel="訓練開始日期" required/></label>
      <label className="training-field-end">結束日期<DateFilterInput name="endDate" defaultValue={dateValue(values.endDate)} ariaLabel="訓練結束日期" required/></label>
      <label className="training-description-field">訓練簡介<textarea name="description" defaultValue={values.description} minLength={10} required/></label>
    </section>
  </form>;
}
