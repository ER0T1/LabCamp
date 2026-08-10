import type { ReactNode } from "react";
import Link from "next/link";

type ActionContent = {
  children: ReactNode;
  className?: string;
};

function classes(className?: string) {
  return ["action-button", className].filter(Boolean).join(" ");
}

export function ActionLink({ href, children, className }: ActionContent & { href: string }) {
  return <Link className={classes(className)} href={href}>{children}</Link>;
}

export function ActionSummary({ children, className }: ActionContent) {
  return <summary className={classes(className)}>{children}</summary>;
}

export function ActionButton({ children, className }: ActionContent) {
  return <button type="submit" className={classes(className)}>{children}</button>;
}
