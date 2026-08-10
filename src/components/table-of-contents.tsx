"use client";

import { useEffect, useRef, useState } from "react";

type Heading = { id: string; text: string; level: number };
type HeadingNode = Heading & { children: HeadingNode[] };

function buildHeadingTree(headings: Heading[]) {
  const roots: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  for (const heading of headings) {
    const node = { ...heading, children: [] };
    while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
    const parent = stack[stack.length - 1];
    (parent ? parent.children : roots).push(node);
    stack.push(node);
  }

  return roots;
}

function TocBranch({ nodes, activeId }: { nodes: HeadingNode[]; activeId: string }) {
  return (
    <ul>
      {nodes.map((heading) => (
        <li key={heading.id}>
          <a
            data-heading-id={heading.id}
            aria-current={activeId === heading.id ? "location" : undefined}
            className={activeId === heading.id ? "active" : undefined}
            href={`#${heading.id}`}
          >
            {heading.text}
          </a>
          {heading.children.length > 0 && <TocBranch nodes={heading.children} activeId={activeId} />}
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const updateActiveHeading = () => {
      const readingLine = Math.min(180, window.innerHeight * 0.25);
      let current = elements[0]?.id ?? "";

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= readingLine) current = element.id;
        else break;
      }

      setActiveId(current);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [headings]);

  useEffect(() => {
    const activeLink = navRef.current?.querySelector<HTMLElement>(`[data-heading-id="${CSS.escape(activeId)}"]`);
    activeLink?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  return (
    <aside className="toc" aria-label="本頁導覽">
      <p className="mono">ON THIS PAGE</p>
      <nav ref={navRef} className="toc-list">
        <TocBranch nodes={buildHeadingTree(headings)} activeId={activeId} />
      </nav>
    </aside>
  );
}
