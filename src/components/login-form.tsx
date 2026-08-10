"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/actions/auth";
import { PasswordInput } from "@/components/password-input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "驗證中…" : "登入成員空間"}<span>→</span></button>;
}

export function LoginForm() {
  const [state, action] = useActionState(login, {} as LoginState);
  return <form className="login-form" action={action}><div><span className="mono">LABCAMP / SIGN IN</span><Link href="/" prefetch={false}>← 返回首頁</Link></div><label>電子信箱<input name="email" type="email" autoComplete="email" required placeholder="name@lab.edu.tw"/></label><label>密碼<PasswordInput name="password" minLength={8} autoComplete="current-password" required placeholder="••••••••"/></label>{state.error && <p className="login-error" role="alert">{state.error}</p>}<SubmitButton/><p className="auth-switch">還沒有帳號？<Link href="/register" prefetch={false}>註冊成員帳號 →</Link></p><small>密碼採 Argon2 安全雜湊保存。</small></form>;
}
