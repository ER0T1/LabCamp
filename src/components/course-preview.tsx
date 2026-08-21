"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type PreviewData = {
  title: string;
  description: string;
  instructor: string;
  training: string;
  content: string;
};

const previewStyles = `
  :root{color:#141713;background:#f3f1e9;font-family:Arial,"Noto Sans TC",sans-serif}
  *{box-sizing:border-box}body{margin:0}.preview{width:min(760px,calc(100% - 48px));margin:0 auto;padding:58px 0 100px}
  header{padding-bottom:42px;border-bottom:1px solid #141713}.eyebrow{margin:0 0 18px;font:700 11px monospace;letter-spacing:.13em;text-transform:uppercase}
  h1{margin:0 0 20px;font-size:56px;line-height:1.1;letter-spacing:-.05em}.description{font-size:17px;line-height:1.8;color:#696b65}
  .meta{display:flex;gap:60px;margin-top:30px}.meta span{display:flex;flex-direction:column;gap:7px;font-size:13px}.meta small{font:9px monospace;color:#696b65}
  .content{padding-top:32px;font-size:15px;line-height:1.9}.content h2{margin-top:58px;padding-top:15px;border-top:1px solid;font-size:28px;letter-spacing:-.03em}
  .content blockquote{margin:30px 0;border-left:4px solid #d9ff43;background:#faf9f4;padding:18px 24px}.content table{width:100%;border-collapse:collapse}
  .content th,.content td{border:1px solid #c9c8be;padding:10px 14px;text-align:left}.content th{background:#141713;color:#faf9f4}.content img{max-width:100%;height:auto}
  .content pre{overflow:auto;border-left:4px solid #d9ff43;background:#1b1e19;color:#e8e9e2;padding:25px}.content code{font-family:monospace;background:#e4e3da;padding:2px 5px}.content pre code{background:none;padding:0}
  .callout{border-left:4px solid #d9ff43;background:#faf9f4;padding:14px 18px}.key-label{border:1px solid #aaa;padding:1px 5px;font-family:monospace}
  @media(max-width:550px){.preview{width:calc(100% - 32px);padding-top:35px}h1{font-size:42px}.meta{gap:30px;flex-wrap:wrap}}
`;

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!);
}

export function CoursePreview({ mode }: { mode: "new" | "edit" }) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!preview) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    document.addEventListener("keydown", close);
    document.body.classList.add("course-preview-open");
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", close);
      document.body.classList.remove("course-preview-open");
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [preview]);

  const openPreview = (button: HTMLButtonElement) => {
    const form = button.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const trainingInput = form.querySelector<HTMLInputElement>('input[name="trainingId"][data-select-label]');
    setPreview({
      title: String(data.get("title") || "未命名課程"),
      description: String(data.get("description") || "尚未填寫課程簡介"),
      instructor: String(data.get("instructor") || "尚未填寫"),
      training: trainingInput?.dataset.selectLabel || "課程預覽",
      content: String(data.get("content") || "<p>尚未撰寫課程內容。</p>"),
    });
  };

  const srcDoc = preview ? `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${previewStyles}</style></head><body><article class="preview"><header><p class="eyebrow">${escapeHtml(preview.training)} / PREVIEW</p><h1>${escapeHtml(preview.title)}</h1><p class="description">${escapeHtml(preview.description)}</p><div class="meta"><span><small>INSTRUCTOR</small>${escapeHtml(preview.instructor)}</span><span><small>STATUS</small>尚未發布的預覽</span></div></header><div class="content">${preview.content}</div></article></body></html>` : "";

  return <>
    <button ref={triggerRef} type="button" className="course-preview-button" onClick={(event) => openPreview(event.currentTarget)} aria-label={`${mode === "new" ? "新增" : "編輯"}課程預覽`}><span>預覽課程</span></button>
    {preview && createPortal(<div className="course-preview-modal" role="dialog" aria-modal="true" aria-label="課程預覽">
      <div className="course-preview-toolbar"><span><b>課程預覽</b><small>顯示目前尚未儲存的內容</small></span><button ref={closeButtonRef} type="button" onClick={() => setPreview(null)} aria-label="關閉課程預覽"><X aria-hidden="true"/>關閉</button></div>
      <iframe title="課程預覽內容" sandbox="" srcDoc={srcDoc}/>
    </div>, document.body)}
  </>;
}
