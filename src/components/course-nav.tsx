"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Training } from "@/lib/data";

export function CourseNav({ training, current }: { training: Training; current: string }) {
  const [open, setOpen] = useState(false);
  return <><button className="course-menu" type="button" aria-expanded={open} aria-controls="course-navigation" onClick={() => setOpen(!open)}>{open ? <X size={17}/> : <Menu size={17}/>} 課程目錄</button><aside id="course-navigation" className={open ? "doc-sidebar open" : "doc-sidebar"}><div><Link href={`/training/${training.slug}`}>← {training.title}</Link><p className="mono">COURSE TREE</p>{training.courses.map(c => <Link onClick={() => setOpen(false)} key={c.slug} className={`${c.slug === current ? "current " : ""}course-depth-${c.depth ?? 0}`} href={`/training/${training.slug}/courses/${c.slug}`}><span>{c.index}</span>{c.title}</Link>)}</div><small>依章節順序排列</small></aside></>;
}
