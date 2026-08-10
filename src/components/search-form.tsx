"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();
  function submit(event: FormEvent) { event.preventDefault(); router.push(`/search?q=${encodeURIComponent(value)}`); }
  return <form className="search-box" onSubmit={submit}><Search/><input autoFocus value={value} onChange={e => setValue(e.target.value)} placeholder="搜尋課程、講師、標籤…" aria-label="搜尋內容"/><button>搜尋</button></form>;
}
