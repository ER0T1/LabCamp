"use server";

import { AuthError } from "next-auth";
import { hash, verify } from "@node-rs/argon2";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string };
export type RegisterState = { error?: string };
export type AccountSettingsState = { error?: string; success?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "姓名至少需要 2 個字。").max(50, "姓名不可超過 50 個字。"),
  email: z.string().trim().email("請輸入有效的電子信箱。"),
  password: z.string().min(8, "密碼至少需要 8 個字元。").max(128, "密碼不可超過 128 個字元。"),
  passwordConfirm: z.string(),
}).refine(({ password, passwordConfirm }) => password === passwordConfirm, {
  message: "兩次輸入的密碼不一致。",
  path: ["passwordConfirm"],
});

const emailSettingsSchema = z.object({
  email: z.string().trim().email("請輸入有效的電子信箱。"),
  currentPassword: z.string().min(1, "請輸入目前密碼。"),
});

const passwordSettingsSchema = z.object({
  currentPassword: z.string().min(1, "請輸入目前密碼。"),
  password: z.string().min(8, "新密碼至少需要 8 個字元。").max(128, "新密碼不可超過 128 個字元。"),
  passwordConfirm: z.string(),
}).refine(({ password, passwordConfirm }) => password === passwordConfirm, {
  message: "兩次輸入的新密碼不一致。",
  path: ["passwordConfirm"],
});

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "電子信箱或密碼不正確。" };
    throw error;
  }
}

export async function logout() { await signOut({ redirectTo: "/" }); }

export async function register(_state: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "請確認註冊資料。" };

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await hash(password), role: "MEMBER" },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "這個電子信箱已經註冊。" };
    }
    throw error;
  }

  await signIn("credentials", { email, password, redirectTo: "/account" });
  return {};
}

export async function updateEmail(_state: AccountSettingsState, formData: FormData): Promise<AccountSettingsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "登入狀態已失效，請重新登入。" };

  const parsed = emailSettingsSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "請確認帳號資料。" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "找不到此帳號，請重新登入。" };
  if (!(await verify(user.passwordHash, parsed.data.currentPassword))) {
    return { error: "目前密碼不正確。" };
  }

  const email = parsed.data.email.toLowerCase();
  if (email === user.email) return { error: "新電子信箱與目前相同。" };

  try {
    await prisma.user.update({ where: { id: user.id }, data: { email } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "這個電子信箱已被其他帳號使用。" };
    }
    throw error;
  }

  revalidatePath("/account");
  return { success: "電子信箱已更新。" };
}

export async function updatePassword(_state: AccountSettingsState, formData: FormData): Promise<AccountSettingsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "登入狀態已失效，請重新登入。" };

  const parsed = passwordSettingsSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "請確認密碼資料。" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "找不到此帳號，請重新登入。" };
  if (!(await verify(user.passwordHash, parsed.data.currentPassword))) {
    return { error: "目前密碼不正確。" };
  }
  if (await verify(user.passwordHash, parsed.data.password)) {
    return { error: "新密碼不可與目前密碼相同。" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(parsed.data.password) },
  });
  return { success: "密碼已更新，下次登入請使用新密碼。" };
}
