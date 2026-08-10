"use client";

import { useFormStatus } from "react-dom";

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "刪除中…" : label}</button>;
}

export function DeleteForm({ action, label, confirmMessage, compact = false }: {
  action: () => Promise<void>;
  label: string;
  confirmMessage: string;
  compact?: boolean;
}) {
  return <form className={compact ? "delete-form compact" : "delete-form"} action={action} onSubmit={event => {
    if (!window.confirm(confirmMessage)) event.preventDefault();
  }}><DeleteButton label={label}/></form>;
}
