import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { trainings as fallbackTrainings, type Course, type Training } from "@/lib/data";

type TrainingRecord = Prisma.TrainingGetPayload<{ include: { courses: { include: { tags: { include: { tag: true } }, attachments: true } } } }>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(date).replace("/", ".");
}

function mapTraining(record: TrainingRecord): Training {
  const sorted = [...record.courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-TW"));
  const byParent = new Map<string | null, typeof sorted>();
  for (const course of sorted) {
    const key = course.parentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), course]);
  }
  const flattened: Course[] = [];
  const visited = new Set<string>();
  const append = (parentId: string | null, prefix: number[] = []) => {
    for (const [position, course] of (byParent.get(parentId) ?? []).entries()) {
      if (visited.has(course.id)) continue;
      visited.add(course.id);
      const path = [...prefix, position + 1];
      flattened.push({ slug: course.slug, index: path.map(part => String(part).padStart(2, "0")).join("."), title: course.title,
        instructor: course.instructor, description: course.description, duration: "2 小時",
        tags: course.tags.map(item => item.tag.name), updatedAt: course.updatedAt.toISOString().slice(0, 10).replaceAll("-", "."),
        content: course.content, attachments: course.attachments.map(item => ({ name: item.name, url: item.url, type: item.type })),
        parentSlug: sorted.find(item => item.id === course.parentId)?.slug, depth: prefix.length });
      append(course.id, path);
    }
  };
  append(null);
  for (const course of sorted) if (!visited.has(course.id)) append(course.parentId, []);
  return {
    slug: record.slug,
    title: record.title,
    titleEn: `${record.season === "SUMMER" ? "SUMMER" : "WINTER"} FIELD NOTES / ${record.year}`,
    year: record.year,
    season: record.season === "SUMMER" ? "夏季" : "冬季",
    range: `${formatDate(record.startDate)} — ${formatDate(record.endDate)}`,
    description: record.description,
    status: record.endDate >= new Date() ? "進行中" : "已結束",
    courses: flattened,
  };
}

const include = { courses: { where: { published: true }, include: { tags: { include: { tag: true } }, attachments: true }, orderBy: { order: "asc" as const } } };

export function decodeSlug(value: string) {
  try { return decodeURIComponent(value); }
  catch { return value; }
}

export async function listTrainings(): Promise<Training[]> {
  try {
    const records = await prisma.training.findMany({ where: { published: true }, include, orderBy: [{ year: "desc" }, { season: "desc" }] });
    return records.map(mapTraining);
  } catch { return fallbackTrainings; }
}

export async function findTraining(slug: string): Promise<Training | undefined> {
  const decodedSlug = decodeSlug(slug);
  try {
    const record = await prisma.training.findUnique({ where: { slug: decodedSlug, published: true }, include });
    return record ? mapTraining(record) : undefined;
  } catch { return fallbackTrainings.find(item => item.slug === decodedSlug); }
}

export async function searchRepository(query: string) {
  const keyword = query.trim();
  if (!keyword) return [];
  try {
    const courses = await prisma.course.findMany({
      where: { published: true, training: { published: true }, OR: [
        { title: { contains: keyword, mode: "insensitive" } }, { description: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } }, { instructor: { contains: keyword, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: keyword, mode: "insensitive" } } } } },
      ] },
      include: { training: { include }, tags: { include: { tag: true } } }, orderBy: { updatedAt: "desc" },
    });
    return courses.map(course => {
      const training = mapTraining(course.training);
      return { training, course: training.courses.find(item => item.slug === course.slug)! };
    }).filter(item => item.course);
  } catch {
    const lower = keyword.toLocaleLowerCase();
    return fallbackTrainings.flatMap(training => training.courses.filter(course => [course.title, course.description, course.instructor, course.content, ...course.tags].join(" ").toLocaleLowerCase().includes(lower)).map(course => ({ training, course })));
  }
}
