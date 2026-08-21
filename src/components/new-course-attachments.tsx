"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { CourseAttachmentsPanel, type CourseAttachmentItem } from "@/components/course-attachments-panel";
import { ExistingAttachmentPicker, type ExistingAttachment } from "@/components/existing-attachment-picker";

const accept = "image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf,application/zip,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.sql,.yml,.yaml";

export function NewCourseAttachments({ availableAttachments }: { availableAttachments: ExistingAttachment[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<ExistingAttachment[]>([]);
  const items: CourseAttachmentItem[] = [
    ...files.map((file, index) => ({
      id: `upload-${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      type: file.type,
      detail: `${file.type || "檔案"} · ${(file.size / 1024 / 1024).toFixed(2)} MB`,
      action: <span className="pending-upload">等待上傳</span>,
    })),
    ...selected.map((attachment) => ({
      id: `existing-${attachment.id}`,
      name: attachment.name,
      type: attachment.type,
      detail: `${attachment.type} · 來自「${attachment.courseTitle}」`,
      action: <button className="draft-attachment-remove" type="button" onClick={() => setSelected((items) => items.filter((item) => item.id !== attachment.id))}>移除</button>,
    })),
  ];
  return <>
    {selected.map((attachment) => <input key={attachment.id} type="hidden" name="existingAttachmentIds" value={attachment.id}/>)}
    <CourseAttachmentsPanel
      className="new-attachment-panel"
      items={items}
      emptyMessage="目前沒有選擇附件。"
      actions={<>
        <label className="attachment-upload">
          <Upload size={16} aria-hidden="true"/><span>新增附件</span>
          <input name="attachments" type="file" multiple accept={accept} onChange={(event) => setFiles(Array.from(event.target.files ?? []))}/>
          <small>{files.length > 0 ? `已選擇 ${files.length} 個檔案` : "最大 20 MB"}</small>
        </label>
        <ExistingAttachmentPicker
          attachments={availableAttachments}
          selectedIds={selected.map((attachment) => attachment.id)}
          onSelect={(attachment) => setSelected((items) => items.some((item) => item.id === attachment.id) ? items : [...items, attachment])}
        />
      </>}
    />
  </>;
}
