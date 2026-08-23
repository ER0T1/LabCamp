"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();
  function submit(event: FormEvent) { event.preventDefault(); router.push(`/search?q=${encodeURIComponent(value.trim())}`); }
  return <form className="search-box" role="search" aria-label="搜尋課程內容" onSubmit={submit}><Search aria-hidden="true"/><input type="search" value={value} onChange={e => setValue(e.target.value)} placeholder="搜尋課程、講師、標籤…" aria-label="搜尋內容"/><button type="submit">搜尋</button></form>;
}
