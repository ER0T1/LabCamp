"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

const accept = "image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf,application/zip,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.sql,.yml,.yaml";

export function NewCourseAttachments() {
  const [files, setFiles] = useState<File[]>([]);
  return <section className="attachment-panel new-attachment-panel">
    <header><div><p className="eyebrow">COURSE FILES</p><h2>課程附件</h2><p>圖片可直接拖曳至編輯器；PDF、壓縮檔與程式碼請由這裡選擇，建立課程時會一起上傳。</p></div><label className="attachment-upload"><Upload size={16}/><span>新增附件</span><input name="attachments" type="file" multiple accept={accept} onChange={event => setFiles(Array.from(event.target.files ?? []))}/><small>{files.length > 0 ? `已選擇 ${files.length} 個檔案` : "每個檔案最大 20 MB"}</small></label></header>
    <div className="attachment-list">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`}><span className="file-icon">{file.type.startsWith("image/") ? "IMG" : "FILE"}</span><div><b>{file.name}</b><small>{file.type || "檔案"} · {(file.size / 1024 / 1024).toFixed(2)} MB</small></div><span className="pending-upload">等待上傳</span></div>)}{files.length === 0 && <p className="empty-attachments">目前沒有選擇附件。</p>}</div>
  </section>;
}
