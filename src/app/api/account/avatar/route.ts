import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { removeUploadedFile, saveUploadedFile, UploadValidationError } from "@/lib/uploads";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "登入狀態已失效，請重新登入。" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "請選擇圖片。" }, { status: 400 });

  let uploaded;
  try {
    uploaded = await saveUploadedFile(file, { imageOnly: true, maxBytes: MAX_AVATAR_BYTES });
  } catch (error) {
    if (error instanceof UploadValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarUrl: true } });
  if (!user) {
    await removeUploadedFile(uploaded.url);
    return NextResponse.json({ error: "找不到此帳號，請重新登入。" }, { status: 404 });
  }
  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl: uploaded.url } });
  if (user.avatarUrl) await removeUploadedFile(user.avatarUrl);
  revalidatePath("/account");
  revalidatePath("/account/settings");
  return NextResponse.json({ url: uploaded.url });
}
