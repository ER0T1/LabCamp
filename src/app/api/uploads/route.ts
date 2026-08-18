import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadValidationError } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role === "MEMBER") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  const courseId = String(formData.get("courseId") ?? "");
  const sourceAttachmentId = String(formData.get("sourceAttachmentId") ?? "");
  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return NextResponse.json({ error: "找不到課程" }, { status: 404 });
  }

  if (sourceAttachmentId) {
    if (!courseId) return NextResponse.json({ error: "缺少課程資訊" }, { status: 400 });
    const source = await prisma.attachment.findUnique({
      where: { id: sourceAttachmentId },
      select: { name: true, url: true, type: true },
    });
    if (!source) return NextResponse.json({ error: "找不到附件" }, { status: 404 });
    const exists = await prisma.attachment.findFirst({ where: { courseId, url: source.url }, select: { id: true } });
    if (exists) return NextResponse.json({ error: "這門課程已經使用此附件" }, { status: 409 });
    const attachment = await prisma.attachment.create({ data: { courseId, ...source } });
    return NextResponse.json(attachment);
  }

  if (!(file instanceof File)) return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });

  let uploaded;
  try { uploaded = await saveUploadedFile(file); }
  catch (error) {
    if (error instanceof UploadValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }

  if (courseId) {
    await prisma.attachment.create({ data: { courseId, ...uploaded } });
  }
  return NextResponse.json({ ...uploaded, default: uploaded.url });
}
