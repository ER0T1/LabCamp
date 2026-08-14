"use client";

import { useEffect, useMemo, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment, Autoformat, BlockQuote, Bold, Bookmark, ClassicEditor, Code, CodeBlock,
  Emoji, Essentials, FindAndReplace, FontBackgroundColor, FontColor, FontFamily, FontSize, Fullscreen,
  GeneralHtmlSupport, Heading, Highlight, HorizontalLine, HtmlEmbed, Image, ImageCaption, ImageInsert,
  ImageInsertViaUrl, ImageResize, ImageStyle, ImageToolbar, ImageUpload, Indent, IndentBlock, Italic,
  Link, LinkImage, List, ListProperties, MediaEmbed, PageBreak, Paragraph, PasteFromOffice, RemoveFormat,
  SelectAll, ShowBlocks, SourceEditing, SpecialCharacters, SpecialCharactersEssentials, Strikethrough,
  Style,
  Subscript, Superscript, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties,
  TableToolbar, TextTransformation, TodoList, Underline, Undo, WordCount, FileRepository, Plugin,
} from "ckeditor5";
import type { FileLoader, UploadAdapter, UploadResponse } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import zhTranslations from "ckeditor5/translations/zh.js";

const plugins = [
  Essentials, Paragraph, Heading, Autoformat, TextTransformation, Bold, Italic, Underline, Strikethrough,
  Subscript, Superscript, Code, RemoveFormat, BlockQuote, CodeBlock, Link, Bookmark, List, ListProperties,
  TodoList, Alignment, Indent, IndentBlock, FontFamily, FontSize, FontColor, FontBackgroundColor, Highlight,
  HorizontalLine, PageBreak, Table, TableToolbar, TableCaption, TableProperties, TableCellProperties,
  TableColumnResize, Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, ImageInsert,
  ImageInsertViaUrl, LinkImage, MediaEmbed, HtmlEmbed, GeneralHtmlSupport,
  SpecialCharacters, SpecialCharactersEssentials, FindAndReplace, SelectAll, ShowBlocks, SourceEditing, Style,
  PasteFromOffice, Emoji, Fullscreen, WordCount, Undo,
];

class LabCampUploadAdapter implements UploadAdapter {
  private controller = new AbortController();
  constructor(private loader: FileLoader, private courseId?: string) {}
  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;
    if (!file) throw new Error("找不到上傳檔案");
    const formData = new FormData(); formData.append("file", file);
    if (this.courseId) formData.append("courseId", this.courseId);
    const response = await fetch("/api/uploads", { method: "POST", body: formData, signal: this.controller.signal });
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) throw new Error(result.error ?? "圖片上傳失敗");
    return { default: result.url };
  }
  abort() { this.controller.abort(); }
}

function createUploadPlugin(courseId?: string) {
  return class LabCampUploadPlugin extends Plugin {
    static get pluginName() { return "LabCampUploadPlugin" as const; }
    init() {
      this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new LabCampUploadAdapter(loader, courseId);
    }
  };
}

export function RichTextEditor({ name, initialData = "", courseId }: { name: string; initialData?: string; courseId?: string }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(initialData);
  const [count, setCount] = useState({ words: 0, characters: 0 });
  const UploadPlugin = useMemo(() => createUploadPlugin(courseId), [courseId]);
  useEffect(() => setReady(true), []);

  if (!ready) return <div className="editor-loading">正在載入文字編輯器…</div>;
  return <div className="rich-editor"><input type="hidden" name={name} value={data}/><CKEditor editor={ClassicEditor} data={initialData} config={{
    licenseKey: "GPL", plugins, extraPlugins: [UploadPlugin],
    language: { ui: "zh", content: "zh" }, translations: [zhTranslations],
    toolbar: { shouldNotGroupWhenFull: true, items: [
      "undo", "redo", "|", "findAndReplace", "selectAll", "|", "heading", "style", "|", "fontFamily", "fontSize", "fontColor", "fontBackgroundColor", "highlight", "|",
      "bold", "italic", "underline", "strikethrough", "subscript", "superscript", "code", "removeFormat", "|", "alignment", "bulletedList", "numberedList", "todoList", "outdent", "indent", "|",
      "link", "bookmark", "insertImage", "insertTable", "mediaEmbed", "blockQuote", "codeBlock", "htmlEmbed", "|",
      "specialCharacters", "emoji", "horizontalLine", "pageBreak", "showBlocks", "sourceEditing", "fullscreen",
    ] },
    heading: { options: [
      { model: "paragraph", title: "段落", class: "ck-heading_paragraph" },
      { model: "heading1", view: "h2", title: "標題 1", class: "ck-heading_heading1" },
      { model: "heading2", view: "h3", title: "標題 2", class: "ck-heading_heading2" },
      { model: "heading3", view: "h4", title: "標題 3", class: "ck-heading_heading3" },
    ] },
    style: { definitions: [
      { name: "提示框", element: "p", classes: ["callout"] },
      { name: "鍵盤按鍵", element: "span", classes: ["key-label"] },
      { name: "圖片邊框", element: "figure", classes: ["image", "image-framed"] },
    ] },
    image: { toolbar: ["imageTextAlternative", "toggleImageCaption", "|", "imageStyle:inline", "imageStyle:wrapText", "imageStyle:breakText", "|", "resizeImage"] },
    table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "toggleTableCaption", "|", "tableProperties", "tableCellProperties"] },
    link: { addTargetToExternalLinks: true, defaultProtocol: "https://" },
    htmlSupport: { allow: [{ name: /.*/, attributes: true, classes: true, styles: true }] },
    // Never execute pasted HTML inside CKEditor's preview iframe. Third-party
    // snippets may register blocked lifecycle handlers (such as `unload`) and
    // can otherwise run arbitrary scripts in the editor page.
    htmlEmbed: { showPreviews: false },
    wordCount: { onUpdate: stats => setCount({ words: stats.words, characters: stats.characters }) },
  }} onReady={(editor) => editor.ui.view.toolbar.switchBehavior("static")} onChange={(_, editor) => setData(editor.getData())}/><div className="editor-count mono">{count.words} WORDS　/　{count.characters} CHARACTERS</div></div>;
}
