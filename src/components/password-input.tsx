"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  name: string;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

export function PasswordInput({ name, placeholder, autoComplete, minLength, maxLength, required }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <input name={name} type={visible ? "text" : "password"} placeholder={placeholder} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} required={required}/>
    <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? "隱藏密碼" : "顯示密碼"} aria-pressed={visible}>
      {visible ? <EyeOff aria-hidden="true"/> : <Eye aria-hidden="true"/>}
    </button>
  </div>;
}
