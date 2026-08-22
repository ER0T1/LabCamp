"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register, type RegisterState } from "@/actions/auth";
import { PasswordInput } from "@/components/password-input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="login-submit" disabled={pending} aria-busy={pending}>{pending ? "建立帳號中…" : "註冊成員帳號"}<span aria-hidden="true">→</span></button>;
}

export function RegisterForm() {
  const [state, action] = useActionState(register, {} as RegisterState);
  return <form className="login-form register-form" action={action}>
    <div className="login-form-heading"><span className="mono">LABCAMP / REGISTER</span><Link href="/login" prefetch={false}>← 返回登入</Link></div>
    <label>姓名<input name="name" type="text" minLength={2} maxLength={50} autoComplete="name" required placeholder="研究室成員姓名"/></label>
    <label>電子信箱<input name="email" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="email" required placeholder="name@lab.edu.tw"/></label>
    <label>密碼<PasswordInput name="password" minLength={8} maxLength={128} autoComplete="new-password" required placeholder="至少 8 個字元"/></label>
    <label>確認密碼<PasswordInput name="passwordConfirm" minLength={8} maxLength={128} autoComplete="new-password" required placeholder="再次輸入密碼"/></label>
    {state.error && <p className="login-error" role="alert">{state.error}</p>}
    <SubmitButton/>
    <small>註冊後將建立一般成員帳號；密碼採 Argon2 安全雜湊保存。</small>
  </form>;
}
