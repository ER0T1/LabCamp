"use client";

import { useMemo, useRef, useState } from "react";
import { FolderOpen, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export type ExistingAttachment = {
  id: string;
  name: string;
  type: string;
  courseTitle: string;
};

export function ExistingAttachmentPicker({
  courseId,
  attachments,
  selectedIds = [],
  onSelect,
}: {
  courseId?: string;
  attachments: ExistingAttachment[];
  selectedIds?: string[];
  onSelect?: (attachment: ExistingAttachment) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    if (!keyword) return attachments;
    return attachments.filter((attachment) =>
      `${attachment.name} ${attachment.courseTitle}`.toLocaleLowerCase().includes(keyword),
    );
  }, [attachments, query]);

  async function attach(attachment: ExistingAttachment) {
    if (!courseId) {
      onSelect?.(attachment);
      dialogRef.current?.close();
      setQuery("");
      return;
    }
    setPendingId(attachment.id);
    setStatus("");
    const body = new FormData();
    body.append("courseId", courseId);
    body.append("sourceAttachmentId", attachment.id);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "加入附件失敗");
      dialogRef.current?.close();
      setQuery("");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "加入附件失敗");
    } finally {
      setPendingId("");
    }
  }

  return <>
    <button className="attachment-picker-trigger" type="button" onClick={() => dialogRef.current?.showModal()}>
      <FolderOpen size={16}/><span>選擇附件</span><small>{attachments.length} 個可用檔案</small>
    </button>
    <dialog ref={dialogRef} className="attachment-picker-dialog" onClose={() => setStatus("")}>
      <header>
        <div><p className="eyebrow">UPLOADED FILES</p><h2>選擇已上傳的附件</h2></div>
        <button type="button" aria-label="關閉" onClick={() => dialogRef.current?.close()}><X size={19}/></button>
      </header>
      <label className="attachment-picker-search">
        <Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋檔名或課程名稱" autoFocus/>
      </label>
      <div className="attachment-picker-list">
        {filtered.map((attachment) => <div key={attachment.id}>
          <span className="file-icon">{attachment.type.startsWith("image") ? "IMG" : "FILE"}</span>
          <div><b>{attachment.name}</b><small>{attachment.type} · 來自「{attachment.courseTitle}」</small></div>
          <button type="button" disabled={Boolean(pendingId) || selectedIds.includes(attachment.id)} onClick={() => attach(attachment)}>
            {pendingId === attachment.id ? "加入中…" : selectedIds.includes(attachment.id) ? "已選擇" : "選擇"}
          </button>
        </div>)}
        {filtered.length === 0 && <p className="empty-attachments">{attachments.length === 0 ? "目前沒有其他已上傳的檔案。" : "找不到符合的檔案。"}</p>}
      </div>
      {status && <p className="attachment-picker-error">{status}</p>}
    </dialog>
  </>;
}
