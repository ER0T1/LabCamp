"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function AvatarSettingsForm({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl ?? "/default-avatar.svg");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPending(true);
    setStatus("上傳中…");
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/account/avatar", { method: "POST", body });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok) throw new Error(result.error ?? "上傳失敗");
      setPreview(result.url ?? localPreview);
      setStatus("頭像已更新。");
      router.refresh();
    } catch (error) {
      setPreview(avatarUrl ?? "/default-avatar.svg");
      setStatus(error instanceof Error ? error.message : "上傳失敗");
    } finally {
      URL.revokeObjectURL(localPreview);
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <section className="avatar-settings-card">
    <div className="account-avatar"><img src={preview} alt={`${name}的頭像`}/></div>
    <div><h2>更換頭像</h2><p>支援 JPG、PNG、GIF、WebP、AVIF，最大 5 MB。</p>
      <label className={`avatar-upload-button${pending ? " pending" : ""}`}><Upload size={16}/><span>{pending ? "上傳中…" : "選擇新頭像"}</span><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" disabled={pending} onChange={upload}/></label>
      {status && <p className="avatar-upload-status" role="status">{status}</p>}
    </div>
  </section>;
}
