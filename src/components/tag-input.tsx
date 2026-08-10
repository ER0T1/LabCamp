"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { X } from "lucide-react";

type Props = { name: string; initialValue?: string; suggestions: string[] };

export function TagInput({ name, initialValue = "", suggestions }: Props) {
  const [tags, setTags] = useState(() => [...new Set(initialValue.split(",").map((tag) => tag.trim()).filter(Boolean))]);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return suggestions.filter((tag) => !tags.includes(tag) && (!keyword || tag.toLocaleLowerCase().includes(keyword))).slice(0, 8);
  }, [query, suggestions, tags]);

  const addTag = (value: string) => {
    const tag = value.trim().replaceAll(",", "");
    if (tag && !tags.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) setTags((current) => [...current, tag]);
    setQuery("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (query.trim()) addTag(matches[0] ?? query);
    } else if (event.key === "Backspace" && !query && tags.length) {
      setTags((current) => current.slice(0, -1));
    }
  };

  return <div className="tag-field">
    <input type="hidden" name={name} value={tags.join(",")}/>
    <div className="tag-input-shell" onClick={(event) => event.currentTarget.querySelector("input")?.focus()}>
      {tags.map((tag) => <span className="tag-chip" key={tag}>{tag}<button type="button" aria-label={`移除 ${tag}`} onClick={() => setTags((current) => current.filter((item) => item !== tag))}><X size={12}/></button></span>)}
      <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onKeyDown} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 120)} placeholder={tags.length ? "新增標籤…" : "搜尋或輸入標籤…"} autoComplete="off"/>
    </div>
    {focused && (matches.length > 0 || query.trim()) && <div className="tag-suggestions">
      {matches.map((tag) => <button type="button" key={tag} onMouseDown={(event) => event.preventDefault()} onClick={() => addTag(tag)}><span>{tag}</span><small>既有標籤</small></button>)}
      {query.trim() && !suggestions.some((tag) => tag.toLocaleLowerCase() === query.trim().toLocaleLowerCase()) && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addTag(query)}><span>新增「{query.trim()}」</span><small>建立標籤</small></button>}
    </div>}
    <small>輸入後按 Enter，或從既有標籤中選取</small>
  </div>;
}
