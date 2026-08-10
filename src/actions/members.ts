"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const roleSchema = z.enum(["ADMIN", "EDITOR", "MEMBER"]);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user;
}

export async function updateMemberRole(id: string, formData: FormData) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id) throw new Error("不可變更自己的角色");

  const role = roleSchema.parse(formData.get("role"));
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin");
  revalidatePath("/admin/members");
}

export async function deleteMember(id: string) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id) throw new Error("不可刪除自己的帳號");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/members");
}
