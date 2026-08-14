"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { unlink } from "node:fs/promises";
import { auth } from "@/auth";
import { recordAuditError, recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, storedFileName, uploadPath } from "@/lib/uploads";

function normalizeSlug(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const trainingSchema = z
  .object({
    title: z.string().trim().min(2).max(80),
    year: z.coerce.number().int().min(2000).max(2100),
    season: z.enum(["WINTER", "SUMMER"]),
    description: z.string().trim().min(10).max(500),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "結束日期不可早於開始日期",
  });

const updateTrainingSchema = z
  .object({ id: z.string().cuid() })
  .and(trainingSchema);

const courseSchema = z.object({
  trainingId: z.string().cuid(),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  instructor: z.string().trim().min(2).max(50),
  order: z.coerce.number().int().min(0),
  parentId: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().cuid().nullable(),
  ),
});

const updateCourseSchema = courseSchema
  .omit({ trainingId: true })
  .extend({ id: z.string().cuid(), tags: z.string().optional() });

async function requireEditor() {
  const session = await auth();
  if (!session?.user || session.user.role === "MEMBER")
    throw new Error("FORBIDDEN");
  return session.user;
}

async function uniqueCourseSlug(
  title: string,
  trainingId: string,
  excludeId?: string,
) {
  const base = normalizeSlug(title) || "course";
  let slug = base;
  let suffix = 2;
  while (
    await prisma.course.findFirst({
      where: {
        trainingId,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

async function uniqueTrainingSlug(title: string, excludeId?: string) {
  const base = normalizeSlug(title) || "training";
  let slug = base;
  let suffix = 2;
  while (
    await prisma.training.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export async function createTraining(formData: FormData) {
  const user = await requireEditor();
  try {
    const input = trainingSchema.parse(Object.fromEntries(formData));
    const slug = await uniqueTrainingSlug(input.title);
    const training = await prisma.training.create({
      data: { ...input, slug, published: formData.get("published") === "on" },
    });
    await recordAuditLog({ action: "CREATE_TRAINING", message: `建立訓練「${training.title}」`, actor: user, resourceType: "Training", resourceId: training.id });
  } catch (error) {
    await recordAuditError({ action: "CREATE_TRAINING", message: "建立訓練", actor: user, resourceType: "Training" }, error);
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/training");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateTraining(formData: FormData) {
  const user = await requireEditor();
  const input = updateTrainingSchema.parse(Object.fromEntries(formData));
  const { id, ...data } = input;
  let existing: { slug: string };
  let training: { id: string; title: string; slug: string };
  try {
    existing = await prisma.training.findUniqueOrThrow({ where: { id }, select: { slug: true } });
    const slug = await uniqueTrainingSlug(data.title, id);
    training = await prisma.training.update({
      where: { id },
      data: { ...data, slug, published: formData.get("published") === "on" },
    });
    await recordAuditLog({ action: "UPDATE_TRAINING", message: `更新訓練「${training.title}」`, actor: user, resourceType: "Training", resourceId: training.id });
  } catch (error) {
    await recordAuditError({ action: "UPDATE_TRAINING", message: "更新訓練", actor: user, resourceType: "Training", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath(`/training/${existing.slug}`);
  revalidatePath(`/training/${training.slug}`);
  redirect("/admin");
}

export async function createCourse(formData: FormData) {
  const user = await requireEditor();
  try {
    const input = courseSchema.parse(Object.fromEntries(formData));
    if (input.parentId) {
      const parent = await prisma.course.findUnique({ where: { id: input.parentId }, select: { trainingId: true } });
      if (!parent || parent.trainingId !== input.trainingId) throw new Error("INVALID_PARENT");
    }
    const slug = await uniqueCourseSlug(input.title, input.trainingId);
    const course = await prisma.course.create({ data: { ...input, slug, published: formData.get("published") === "on" } });
    await syncTags(course.id, String(formData.get("tags") ?? ""));
    await syncEmbeddedUploads(course.id, input.content);
    const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
    for (const file of files) {
      const uploaded = await saveUploadedFile(file);
      await prisma.attachment.create({ data: { courseId: course.id, ...uploaded } });
    }
    await recordAuditLog({ action: "CREATE_COURSE", message: `建立課程「${course.title}」`, actor: user, resourceType: "Course", resourceId: course.id, metadata: { attachmentCount: files.length } });
  } catch (error) {
    await recordAuditError({ action: "CREATE_COURSE", message: "建立課程", actor: user, resourceType: "Course" }, error);
    throw error;
  }
  revalidatePath(`/training`);
  revalidatePath("/admin");
  redirect("/admin");
}

async function syncTags(courseId: string, value: string) {
  const names = [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
  await prisma.courseTag.deleteMany({ where: { courseId } });
  for (const name of names) {
    const slug = name
      .toLocaleLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
    await prisma.courseTag.create({ data: { courseId, tagId: tag.id } });
  }
}

async function syncEmbeddedUploads(courseId: string, content: string) {
  const urls = [
    ...content.matchAll(
      /(?:src|url)=["'](\/api\/uploads\/[a-f0-9-]{36}\.[a-z0-9]{1,8})["']/g,
    ),
  ].map((match) => match[1]);
  for (const url of new Set(urls)) {
    const exists = await prisma.attachment.findFirst({
      where: { courseId, url },
      select: { id: true },
    });
    if (!exists)
      await prisma.attachment.create({
        data: { courseId, name: "課程內嵌圖片", url, type: "image" },
      });
  }
}

async function removeStoredFiles(urls: string[]) {
  await Promise.all(
    urls.map(async (url) => {
      const name = storedFileName(url);
      if (name) await unlink(uploadPath(name)).catch(() => undefined);
    }),
  );
}

export async function updateCourse(formData: FormData) {
  const user = await requireEditor();
  const input = updateCourseSchema.parse(Object.fromEntries(formData));
  const { id, tags, ...data } = input;
  let existing: { slug: string; trainingId: string; training: { slug: string } };
  let course: { id: string; title: string; slug: string; training: { slug: string } };
  try {
    existing = await prisma.course.findUniqueOrThrow({ where: { id }, include: { training: true } });
    if (data.parentId === id) throw new Error("INVALID_PARENT");
    if (data.parentId) {
      const parent = await prisma.course.findUnique({
        where: { id: data.parentId },
        select: { trainingId: true, parentId: true },
      });
      if (!parent || parent.trainingId !== existing.trainingId) throw new Error("INVALID_PARENT");
      let cursor = parent.parentId;
      while (cursor) {
        if (cursor === id) throw new Error("COURSE_TREE_CYCLE");
        const ancestor = await prisma.course.findUnique({ where: { id: cursor }, select: { parentId: true } });
        cursor = ancestor?.parentId ?? null;
      }
    }
    const slug = await uniqueCourseSlug(data.title, existing.trainingId, id);
    course = await prisma.course.update({
      where: { id },
      data: { ...data, slug, published: formData.get("published") === "on" },
      include: { training: true },
    });
    await syncTags(id, tags ?? "");
    await syncEmbeddedUploads(id, data.content);
    await recordAuditLog({ action: "UPDATE_COURSE", message: `更新課程「${course.title}」`, actor: user, resourceType: "Course", resourceId: course.id });
  } catch (error) {
    await recordAuditError({ action: "UPDATE_COURSE", message: "更新課程", actor: user, resourceType: "Course", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/training");
  revalidatePath(`/training/${course.training.slug}/courses/${existing.slug}`);
  revalidatePath(`/training/${course.training.slug}/courses/${course.slug}`);
  redirect(`/admin/courses/${id}/edit?saved=1`);
}

export async function deleteTraining(id: string) {
  const user = await requireEditor();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  try {
    const [training, attachments] = await Promise.all([
      prisma.training.findUniqueOrThrow({ where: { id }, select: { title: true } }),
      prisma.attachment.findMany({ where: { course: { trainingId: id } }, select: { url: true } }),
    ]);
    await prisma.training.delete({ where: { id } });
    await removeStoredFiles(attachments.map((item) => item.url));
    await recordAuditLog({ level: "WARNING", action: "DELETE_TRAINING", message: `刪除訓練「${training.title}」`, actor: user, resourceType: "Training", resourceId: id, metadata: { deletedAttachmentCount: attachments.length } });
  } catch (error) {
    await recordAuditError({ action: "DELETE_TRAINING", message: "刪除訓練", actor: user, resourceType: "Training", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/training");
  revalidatePath("/admin");
}

export async function deleteCourse(id: string) {
  const user = await requireEditor();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  let course: { title: string; slug: string; training: { slug: string }; attachments: { url: string }[] };
  try {
    course = await prisma.course.delete({ where: { id }, include: { training: true, attachments: true } });
    await removeStoredFiles(course.attachments.map((item) => item.url));
    await recordAuditLog({ level: "WARNING", action: "DELETE_COURSE", message: `刪除課程「${course.title}」`, actor: user, resourceType: "Course", resourceId: id, metadata: { deletedAttachmentCount: course.attachments.length } });
  } catch (error) {
    await recordAuditError({ action: "DELETE_COURSE", message: "刪除課程", actor: user, resourceType: "Course", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/training");
  revalidatePath("/admin");
  revalidatePath(`/training/${course.training.slug}`);
  revalidatePath(`/training/${course.training.slug}/courses/${course.slug}`);
  redirect("/admin");
}

export async function deleteAttachment(id: string) {
  const user = await requireEditor();
  let attachment: { name: string; url: string; courseId: string; course: { slug: string; training: { slug: string } } };
  try {
    attachment = await prisma.attachment.delete({ where: { id }, include: { course: { include: { training: true } } } });
    await removeStoredFiles([attachment.url]);
    await recordAuditLog({ level: "WARNING", action: "DELETE_ATTACHMENT", message: `刪除附件「${attachment.name}」`, actor: user, resourceType: "Attachment", resourceId: id, metadata: { courseId: attachment.courseId } });
  } catch (error) {
    await recordAuditError({ action: "DELETE_ATTACHMENT", message: "刪除附件", actor: user, resourceType: "Attachment", resourceId: id }, error);
    throw error;
  }
  revalidatePath(`/admin/courses/${attachment.courseId}/edit`);
  revalidatePath(
    `/training/${attachment.course.training.slug}/courses/${attachment.course.slug}`,
  );
}
