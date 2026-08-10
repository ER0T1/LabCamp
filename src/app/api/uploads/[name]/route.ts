import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { uploadPath } from "@/lib/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const buffer = await readFile(uploadPath(name));
    const detected = await fileTypeFromBuffer(buffer);
    const isImage = detected?.mime.startsWith("image/");
    return new NextResponse(buffer, { headers: {
      "Content-Type": detected?.mime ?? "application/octet-stream",
      "Content-Disposition": `${isImage ? "inline" : "attachment"}; filename="${name}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
