"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function AttachmentUploader({ courseId }: { courseId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const router = useRouter();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("上傳中…");
    const body = new FormData(); body.append("file", file); body.append("courseId", courseId);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "上傳失敗");
      setStatus("上傳完成"); router.refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "上傳失敗"); }
    finally { if (inputRef.current) inputRef.current.value = ""; }
  }

  return <label className="attachment-upload"><Upload size={16} aria-hidden="true"/><span>新增附件</span><input ref={inputRef} type="file" onChange={upload} accept="image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf,application/zip,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.py,.sql,.yml,.yaml"/><small role="status">{status || "最大 20 MB"}</small></label>;
}
