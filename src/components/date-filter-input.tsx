"use client";

import { CalendarDays } from "lucide-react";
import { KeyboardEvent, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  ariaLabel: string;
  required?: boolean;
};

function displayDate(value: string) {
  return value ? value.replaceAll("-", "/") : "年 / 月 / 日";
}

export function DateFilterInput({ name, defaultValue = "", ariaLabel, required = false }: Props) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    try { input.showPicker(); } catch { /* Older Safari keeps the native input fallback. */ }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPicker();
  };
  return <span className={`date-filter-control${value ? " has-value" : ""}`} onClick={openPicker} onKeyDown={onKeyDown}>
    <span aria-hidden="true">{displayDate(value)}</span>
    <CalendarDays size={15} aria-hidden="true"/>
    <input ref={inputRef} name={name} type="date" value={value} onChange={event => setValue(event.target.value)} aria-label={ariaLabel} required={required}/>
  </span>;
}
