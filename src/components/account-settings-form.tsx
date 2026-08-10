"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateEmail,
  updatePassword,
  type AccountSettingsState,
} from "@/actions/auth";
import { PasswordInput } from "@/components/password-input";

function SettingsSubmit({ idle, pending }: { idle: string; pending: string }) {
  const status = useFormStatus();
  return <button className="action-button" disabled={status.pending}>{status.pending ? pending : idle}<span>→</span></button>;
}

function Feedback({ state }: { state: AccountSettingsState }) {
  if (state.error) return <p className="login-error" role="alert">{state.error}</p>;
  if (state.success) return <p className="account-success" role="status">{state.success}</p>;
  return null;
}

export function EmailSettingsForm({ email }: { email: string }) {
  const [state, action] = useActionState(updateEmail, {} as AccountSettingsState);
  return <form className="account-settings-form" action={action}>
    <h2>更換電子信箱</h2>
    <p>更新後，新的電子信箱將成為下次登入使用的帳號。</p>
    <div className="current-account-email"><span>目前電子信箱</span><strong>{email}</strong></div>
    <label>新電子信箱<input name="email" type="email" autoComplete="email" placeholder="請輸入新的電子信箱" required/></label>
    <label>密碼<input name="currentPassword" type="password" autoComplete="current-password" placeholder="請輸入目前密碼" required/></label>
    <Feedback state={state}/>
    <SettingsSubmit idle="更新電子信箱" pending="更新中…"/>
  </form>;
}

export function PasswordSettingsForm() {
  const [state, action] = useActionState(updatePassword, {} as AccountSettingsState);
  return <form className="account-settings-form" action={action}>
    <h2>更換密碼</h2>
    <p>新密碼需至少 8 個字元，更新後會以 Argon2 安全雜湊保存。</p>
    <label>目前密碼<input name="currentPassword" type="password" autoComplete="current-password" required/></label>
    <label>新密碼<PasswordInput name="password" minLength={8} maxLength={128} autoComplete="new-password" required/></label>
    <label>確認新密碼<PasswordInput name="passwordConfirm" minLength={8} maxLength={128} autoComplete="new-password" required/></label>
    <Feedback state={state}/>
    <SettingsSubmit idle="更新密碼" pending="更新中…"/>
  </form>;
}
