import type { LoginEvent } from "@prisma/client";
import { isIP } from "node:net";
import { prisma } from "@/lib/prisma";

type HeaderReader = Pick<Headers, "get">;

function normalizeIp(value: string | null | undefined) {
  const ip = value?.trim().replace(/^::ffff:/i, "") ?? "";
  return isIP(ip) ? ip : null;
}

function isPrivateIp(ip: string) {
  if (isIP(ip) === 4) {
    const [first, second] = ip.split(".").map(Number);
    return first === 10
      || first === 127
      || first === 0
      || (first === 100 && second >= 64 && second <= 127)
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && second === 168);
  }
  const normalized = ip.toLowerCase();
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized);
}

function publicIpOrNull(value: string | null | undefined) {
  const ip = normalizeIp(value);
  return ip && !isPrivateIp(ip) ? ip : null;
}

export function getRequestMetadata(headers: HeaderReader) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const requestIp = normalizeIp(headers.get("x-real-ip")) ?? normalizeIp(forwardedFor);
  const fallbackIp = publicIpOrNull(process.env.LOGIN_LOG_PRIVATE_IP_FALLBACK);
  return {
    ipAddress: requestIp && !isPrivateIp(requestIp) ? requestIp : fallbackIp,
    userAgent: headers.get("user-agent")?.trim() || null,
  };
}

export async function recordLoginEvent(data: {
  userId?: string | null;
  email?: string | null;
  event: LoginEvent;
  headers: HeaderReader;
  failureReason?: string | null;
}) {
  try {
    await prisma.loginLog.create({
      data: {
        userId: data.userId,
        email: data.email?.trim().toLowerCase() || null,
        event: data.event,
        failureReason: data.failureReason,
        ...getRequestMetadata(data.headers),
      },
    });
  } catch (error) {
    // Audit logging must not lock users out if the log store is temporarily unavailable.
    console.error("Failed to write login log", error);
  }
}
