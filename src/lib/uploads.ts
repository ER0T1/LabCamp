import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";

// Keep uploads outside Next.js build output and independent of the directory
// from which the server process was started.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/home/m11305502/LabCamp/storage/uploads";
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const allowed = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/gif", "gif"], ["image/webp", "webp"], ["image/avif", "avif"],
  ["application/pdf", "pdf"], ["application/zip", "zip"],
]);
const textExtensions = new Set(["txt", "md", "csv", "json", "js", "ts", "tsx", "jsx", "py", "sql", "yml", "yaml"]);

export class UploadValidationError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function ensureUploadDirectory() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export function uploadPath(fileName: string) {
  if (!/^[a-f0-9-]{36}\.[a-z0-9]{1,8}$/.test(fileName)) throw new Error("INVALID_FILE_NAME");
  return path.join(UPLOAD_DIR, fileName);
}

export function storedFileName(url: string) {
  const match = url.match(/^\/api\/uploads\/([a-f0-9-]{36}\.[a-z0-9]{1,8})$/);
  return match?.[1];
}

export async function saveUploadedFile(file: File, options?: { imageOnly?: boolean; maxBytes?: number }) {
  const maxBytes = options?.maxBytes ?? MAX_UPLOAD_BYTES;
  if (!file.size || file.size > maxBytes) throw new UploadValidationError(`檔案不可超過 ${Math.floor(maxBytes / 1024 / 1024)} MB`, 413);
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const originalExtension = file.name.split(".").pop()?.toLocaleLowerCase() ?? "";
  let extension = detected ? allowed.get(detected.mime) : undefined;
  let mimeType = detected?.mime;
  if (options?.imageOnly && !mimeType?.startsWith("image/")) throw new UploadValidationError("頭像僅支援 JPG、PNG、GIF、WebP 或 AVIF 圖片", 415);
  if (!extension && !detected && textExtensions.has(originalExtension)) { extension = originalExtension; mimeType = "text/plain"; }
  if (!extension || !mimeType) throw new UploadValidationError("不支援此檔案格式", 415);
  const fileName = `${randomUUID()}.${extension}`;
  await ensureUploadDirectory();
  await writeFile(uploadPath(fileName), buffer, { flag: "wx" });
  return { url: `/api/uploads/${fileName}`, type: mimeType, name: file.name.slice(0, 180) };
}

export async function removeUploadedFile(url: string) {
  const fileName = storedFileName(url);
  if (!fileName) return;
  try { await unlink(uploadPath(fileName)); } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
}
