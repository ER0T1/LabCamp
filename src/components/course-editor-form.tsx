"use client";

import { useState } from "react";
import Link from "next/link";
import { ClientRichTextEditor } from "@/components/client-rich-text-editor";
import { NewCourseAttachments } from "@/components/new-course-attachments";
import { TagInput } from "@/components/tag-input";
import { CoursePreview } from "@/components/course-preview";
import { StyledSelect } from "@/components/styled-select";
import type { ExistingAttachment } from "@/components/existing-attachment-picker";
import { CourseOrderEditor, type OrderableCourse } from "@/components/course-order-editor";

type Values = {
  id?: string;
  trainingId?: string;
  title?: string;
  description?: string;
  instructor?: string;
  order?: number;
  content?: string;
  tags?: string;
  published?: boolean;
  parentId?: string | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  values?: Values;
  trainings: { id: string; title: string; courses?: { id: string; title: string; trainingId: string }[] }[];
  parentCourses?: OrderableCourse[];
  tagSuggestions?: string[];
  saved?: boolean;
  availableAttachments?: ExistingAttachment[];
};

export function CourseEditorForm({
  action,
  values = {},
  trainings,
  parentCourses = [],
  tagSuggestions = [],
  saved = false,
  availableAttachments = [],
}: Props) {
  const availableParents = parentCourses.length > 0 ? parentCourses : trainings.flatMap((training) => training.courses ?? []);
  const [trainingId, setTrainingId] = useState(values.trainingId ?? trainings[0]?.id ?? "");
  const [parentId, setParentId] = useState(values.parentId ?? null);
  const [courseTitle, setCourseTitle] = useState(values.title ?? "");
  const siblingCount = parentCourses.filter((course) => course.trainingId === trainingId && (course.parentId ?? null) === parentId).length;
  const remainsInOriginalLayer = trainingId === values.trainingId && parentId === (values.parentId ?? null);
  return (
    <form action={action} className="course-editor-form">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="editor-bar">
        <div>
          <Link href="/admin">← 管理後台</Link>
          <p className="eyebrow">COURSE EDITOR</p>
          <h1>{values.id ? "編輯課程" : "新增課程"}</h1>
        </div>
        <div className="editor-actions">
          {saved && <span className="saved-badge">已儲存</span>}
          <label className="publish-check publication-switch">
            <input
              name="published"
              type="checkbox"
              defaultChecked={values.published}
            />{" "}
            發布
          </label>
          <CoursePreview mode={values.id ? "edit" : "new"} />
          <button type="submit" className="course-save-button">儲存課程 →</button>
        </div>
      </div>
      <div className="editor-fields-panel">
        <div className="editor-fields">
          <label className="course-field-training">
            所屬訓練
            <StyledSelect
              name="trainingId"
              defaultValue={values.trainingId}
              value={trainingId}
              onValueChange={(value) => { setTrainingId(value); setParentId(null); }}
              disabled={Boolean(values.id)}
              required
              ariaLabel="所屬訓練"
              options={trainings.map((item) => ({ value: item.id, label: item.title }))}
            />
            {values.id && (
              <input type="hidden" name="trainingId" value={values.trainingId} />
            )}
          </label>
          <label className="course-field-parent">
            父課程
            <StyledSelect
              name="parentId"
              defaultValue={values.parentId ?? ""}
              value={parentId ?? ""}
              onValueChange={(value) => setParentId(value || null)}
              ariaLabel="父課程"
              options={[{ value: "", label: "無（根課程）" }, ...availableParents
                .filter((item) => item.trainingId === trainingId && item.id !== values.id)
                .map((item) => ({ value: item.id, label: item.title }))]}
            />
            <small>設為某課程的子課程</small>
          </label>
          <label className="course-field-title">
            課程名稱
            <input type="text" name="title" defaultValue={values.title} onChange={(event) => setCourseTitle(event.target.value)} required />
            <small>公開網址會依課程名稱自動產生</small>
          </label>
          <label className="course-field-instructor">
            講師
            <input type="text" name="instructor" defaultValue={values.instructor} required />
          </label>
        </div>
        <CourseOrderEditor
          courses={parentCourses}
          currentId={values.id}
          currentTitle={courseTitle}
          currentOrder={remainsInOriginalLayer ? values.order ?? siblingCount : siblingCount}
          trainingId={trainingId}
          parentId={parentId}
        />
        <div className="editor-long-fields">
          <div className="tags-wide">
            <label htmlFor="course-tags">標籤</label>
            <TagInput inputId="course-tags" name="tags" initialValue={values.tags} suggestions={tagSuggestions}/>
          </div>
          <label className="wide course-description-field">
            課程簡介
            <textarea
              name="description"
              defaultValue={values.description}
              minLength={10}
              required
            />
          </label>
        </div>
      </div>
      <ClientRichTextEditor
        name="content"
        initialData={values.content}
        courseId={values.id}
      />
      {!values.id && <NewCourseAttachments availableAttachments={availableAttachments}/>}
    </form>
  );
}
