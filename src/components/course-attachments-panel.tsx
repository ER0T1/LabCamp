import type { ReactNode } from "react";

export type CourseAttachmentItem = {
  id: string;
  name: string;
  type: string;
  detail: string;
  href?: string;
  action?: ReactNode;
};

export function CourseAttachmentsPanel({
  actions,
  items,
  emptyMessage = "目前沒有獨立附件。",
  className = "",
}: {
  actions: ReactNode;
  items: CourseAttachmentItem[];
  emptyMessage?: string;
  className?: string;
}) {
  return <section className={`attachment-panel ${className}`.trim()}>
    <header>
      <div>
        <p className="eyebrow">COURSE FILES</p>
        <h2>課程附件</h2>
        <p>圖片可直接拖曳至編輯器；PDF、壓縮檔與程式碼請由這裡新增或選擇。</p>
      </div>
      <div className="attachment-actions">{actions}</div>
    </header>
    <div className="attachment-list">
      {items.map((item) => <div key={item.id}>
        <span className="file-icon">{item.type.startsWith("image") ? "IMG" : "FILE"}</span>
        <div>
          {item.href
            ? <a href={item.href} target="_blank" rel="noreferrer">{item.name}</a>
            : <b>{item.name}</b>}
          <small>{item.detail}</small>
        </div>
        {item.action}
      </div>)}
      {items.length === 0 && <p className="empty-attachments">{emptyMessage}</p>}
    </div>
  </section>;
}
