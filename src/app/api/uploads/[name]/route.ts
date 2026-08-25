import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/lib/prisma";
import { uploadPath } from "@/lib/uploads";

function contentDisposition(disposition: "inline" | "attachment", originalName: string, storedName: string) {
  const fileName = originalName.replace(/[\r\n]/g, "").trim() || storedName;
  const asciiName = fileName
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
  const encodedName = encodeURIComponent(fileName).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const url = `/api/uploads/${name}`;
    const [buffer, attachment] = await Promise.all([
      readFile(uploadPath(name)),
      prisma.attachment.findFirst({
        where: { url },
        orderBy: { createdAt: "asc" },
        select: { name: true },
      }),
    ]);
    const detected = await fileTypeFromBuffer(buffer);
    const isImage = detected?.mime.startsWith("image/");
    return new NextResponse(buffer, { headers: {
      "Content-Type": detected?.mime ?? "application/octet-stream",
      "Content-Disposition": contentDisposition(isImage ? "inline" : "attachment", attachment?.name ?? name, name),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
