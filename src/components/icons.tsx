import type { SVGProps } from "react";

export function Mark({ className }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={className} aria-hidden="true"><path d="M4 4h10v10H4zM18 4h10v24H18zM4 18h10v10H4z" fill="currentColor"/></svg>;
}

export function Arrow({ className, ...props }: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 20 20" className={className} fill="none" {...props}><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
