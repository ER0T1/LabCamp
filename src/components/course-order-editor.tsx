"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export type OrderableCourse = {
  id: string;
  title: string;
  trainingId: string;
  parentId: string | null;
  order: number;
};

const CURRENT_COURSE = "__current_course__";

export function CourseOrderEditor({
  courses,
  currentId,
  currentTitle,
  currentOrder,
  trainingId,
  parentId,
}: {
  courses: OrderableCourse[];
  currentId?: string;
  currentTitle: string;
  currentOrder: number;
  trainingId: string;
  parentId: string | null;
}) {
  const currentKey = currentId ?? CURRENT_COURSE;
  const siblings = useMemo(() => courses
    .filter((course) => course.trainingId === trainingId && (course.parentId ?? null) === parentId && course.id !== currentId)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-TW")),
  [courses, currentId, parentId, trainingId]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState("");

  useEffect(() => {
    const ids = siblings.map((course) => course.id);
    ids.splice(Math.min(Math.max(currentOrder, 0), ids.length), 0, currentKey);
    setOrderedIds(ids);
  }, [currentKey, currentOrder, siblings]);

  const byId = new Map(siblings.map((course) => [course.id, course]));
  const moveTo = (sourceId: string, targetId: string, afterTarget: boolean) => {
    if (!sourceId || sourceId === targetId) return;
    setOrderedIds((items) => {
      const next = items.filter((id) => id !== sourceId);
      const targetIndex = next.indexOf(targetId);
      const insertAt = targetIndex < 0 ? next.length : targetIndex + (afterTarget ? 1 : 0);
      next.splice(insertAt, 0, sourceId);
      return next;
    });
  };
  const moveBy = (id: string, offset: number) => {
    setOrderedIds((items) => {
      const index = items.indexOf(id);
      const destination = index + offset;
      if (index < 0 || destination < 0 || destination >= items.length) return items;
      const next = [...items];
      next.splice(index, 1);
      next.splice(destination, 0, id);
      return next;
    });
  };
  const currentPosition = Math.max(0, orderedIds.indexOf(currentKey));

  return <div className="course-order-editor">
    <div className="course-order-heading">
      <div><b>同層課程排序</b><small>拖曳項目調整順序；只顯示相同父課程下的課程。</small></div>
      <span>{orderedIds.length} 門課程</span>
    </div>
    <input type="hidden" name="order" value={currentPosition}/>
    <input type="hidden" name="siblingOrder" value={JSON.stringify(orderedIds)}/>
    <div className="course-order-list" role="list" aria-label="同層課程排序">
      {orderedIds.map((id, index) => {
        const isCurrent = id === currentKey;
        const title = isCurrent ? currentTitle.trim() || "未命名的新課程" : byId.get(id)?.title ?? "未知課程";
        return <div
          key={id}
          role="listitem"
          className={`${isCurrent ? "current " : ""}${draggedId === id ? "dragging" : ""}`.trim()}
          draggable
          onDragStart={(event) => {
            setDraggedId(id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            const bounds = event.currentTarget.getBoundingClientRect();
            moveTo(draggedId || event.dataTransfer.getData("text/plain"), id, event.clientY > bounds.top + bounds.height / 2);
          }}
          onDrop={(event) => {
            event.preventDefault();
            const bounds = event.currentTarget.getBoundingClientRect();
            moveTo(draggedId || event.dataTransfer.getData("text/plain"), id, event.clientY > bounds.top + bounds.height / 2);
            setDraggedId("");
          }}
          onDragEnd={() => setDraggedId("")}
        >
          <GripVertical aria-hidden="true"/>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{title}</b>
          <div className="course-order-actions">
            {isCurrent && <small>{currentId ? "目前編輯" : "新增課程"}</small>}
            <button type="button" disabled={index === 0} onClick={() => moveBy(id, -1)} aria-label={`將「${title}」往上移`}><ChevronUp aria-hidden="true"/></button>
            <button type="button" disabled={index === orderedIds.length - 1} onClick={() => moveBy(id, 1)} aria-label={`將「${title}」往下移`}><ChevronDown aria-hidden="true"/></button>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
