import type { AuditLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditActor = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type AuditLogInput = {
  level?: AuditLevel;
  action: string;
  message: string;
  actor?: AuditActor | null;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        level: input.level ?? "INFO",
        action: input.action,
        message: input.message,
        userId: input.actor?.id,
        actorName: input.actor?.name,
        actorEmail: input.actor?.email,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}

export async function recordAuditError(input: Omit<AuditLogInput, "level">, error: unknown) {
  const reason = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  await recordAuditLog({
    ...input,
    level: "ERROR",
    action: `${input.action}_FAILED`,
    message: `${input.message}失敗`,
    metadata: { reason },
  });
}
