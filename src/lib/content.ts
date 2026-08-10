import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

export async function toEditorHtml(content: string) {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return await marked.parse(content, { gfm: true });
}

export async function toSafeHtml(content: string) {
  const html = await toEditorHtml(content);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "oembed", "iframe", "s", "u", "sub", "sup"]),
    allowedAttributes: { "*": ["class", "style", "id", "title"], a: ["href", "name", "target", "rel"], img: ["src", "alt", "width", "height"], oembed: ["url"], iframe: ["src", "allow", "allowfullscreen", "width", "height", "frameborder"] },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
  });
}

export function buildDocumentOutline(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();
  const content = html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, level, attributes, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").trim();
    let id = text.toLocaleLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || "section";
    const root = id; let suffix = 2;
    while (used.has(id)) id = `${root}-${suffix++}`;
    used.add(id); headings.push({ id, text, level: Number(level) });
    const cleanAttributes = String(attributes).replace(/\s+id=("[^"]*"|'[^']*')/i, "");
    return `<h${level}${cleanAttributes} id="${id}">${inner}</h${level}>`;
  });
  return { content, headings };
}
