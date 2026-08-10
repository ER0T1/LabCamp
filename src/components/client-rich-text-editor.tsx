"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/rich-text-editor").then(module => module.RichTextEditor),
  { ssr: false, loading: () => <div className="editor-loading">正在載入文字編輯器…</div> },
);

export function ClientRichTextEditor(props: { name: string; initialData?: string; courseId?: string }) {
  return <Editor {...props}/>;
}
