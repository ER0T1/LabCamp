"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAuditError, recordAuditLog } from "@/lib/audit-log";
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

  try {
    const role = roleSchema.parse(formData.get("role"));
    const member = await prisma.user.update({ where: { id }, data: { role } });
    await recordAuditLog({
      level: "WARNING",
      action: "UPDATE_MEMBER_ROLE",
      message: `將「${member.name}」的角色調整為 ${role}`,
      actor: currentUser,
      resourceType: "User",
      resourceId: member.id,
      metadata: { role, memberEmail: member.email },
    });
  } catch (error) {
    await recordAuditError({ action: "UPDATE_MEMBER_ROLE", message: "調整成員角色", actor: currentUser, resourceType: "User", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
}

export async function deleteMember(id: string) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id) throw new Error("不可刪除自己的帳號");

  try {
    const member = await prisma.user.delete({ where: { id } });
    await recordAuditLog({
      level: "WARNING",
      action: "DELETE_MEMBER",
      message: `刪除成員「${member.name}」`,
      actor: currentUser,
      resourceType: "User",
      resourceId: member.id,
      metadata: { memberEmail: member.email, role: member.role },
    });
  } catch (error) {
    await recordAuditError({ action: "DELETE_MEMBER", message: "刪除成員", actor: currentUser, resourceType: "User", resourceId: id }, error);
    throw error;
  }
  revalidatePath("/admin");
  revalidatePath("/admin/members");
}
