"use client";

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
};

export function StyledSelect({
  name,
  options,
  defaultValue,
  disabled = false,
  required = false,
  ariaLabel,
}: Props) {
  const initialValue = options.some((option) => option.value === defaultValue)
    ? defaultValue!
    : options[0]?.value ?? "";
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(() => Math.max(0, options.findIndex((option) => option.value === initialValue)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    setValue(option.value);
    setHighlighted(index);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(highlighted);
      else setOpen(true);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      if (event.key === "Home") setHighlighted(0);
      else if (event.key === "End") setHighlighted(options.length - 1);
      else setHighlighted((current) => {
        const offset = event.key === "ArrowDown" ? 1 : -1;
        return (current + offset + options.length) % options.length;
      });
    }
  };

  return <div className={`styled-select${open ? " open" : ""}${disabled ? " disabled" : ""}`} ref={rootRef}>
    <input type="hidden" name={name} value={value} disabled={disabled} data-select-label={selected?.label ?? ""}/>
    <button
      type="button"
      role="combobox"
      aria-label={ariaLabel}
      aria-controls={listId}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-required={required}
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={onKeyDown}
    >
      <span>{selected?.label ?? "請選擇"}</span>
      <ChevronDown aria-hidden="true"/>
    </button>
    {open && <div className="styled-select-options" id={listId} role="listbox" aria-label={ariaLabel}>
      {options.map((option, index) => <button
        type="button"
        role="option"
        aria-selected={option.value === value}
        className={index === highlighted ? "highlighted" : undefined}
        key={option.value}
        onPointerMove={() => setHighlighted(index)}
        onClick={() => choose(index)}
      >
        <span>{option.label}</span>
        {option.value === value && <Check aria-hidden="true"/>}
      </button>)}
    </div>}
  </div>;
}
