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
  if (!(file instanceof File)) return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return NextResponse.json({ error: "找不到課程" }, { status: 404 });
  }

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
