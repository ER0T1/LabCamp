import Link from "next/link";
import { ClientRichTextEditor } from "@/components/client-rich-text-editor";
import { NewCourseAttachments } from "@/components/new-course-attachments";
import { TagInput } from "@/components/tag-input";

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
  parentCourses?: { id: string; title: string; trainingId: string }[];
  tagSuggestions?: string[];
  saved?: boolean;
};

export function CourseEditorForm({
  action,
  values = {},
  trainings,
  parentCourses = [],
  tagSuggestions = [],
  saved = false,
}: Props) {
  const availableParents = parentCourses.length > 0 ? parentCourses : trainings.flatMap((training) => training.courses ?? []);
  return (
    <form action={action} className="course-editor-form">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="editor-bar">
        <div>
          <Link href="/admin">← 管理後台</Link>
          <p className="eyebrow">COURSE EDITOR</p>
          <h1>{values.id ? "編輯課程" : "新增課程"}</h1>
        </div>
        <div>
          {saved && <span className="saved-badge">已儲存</span>}
          <label className="publish-check">
            <input
              name="published"
              type="checkbox"
              defaultChecked={values.published}
            />{" "}
            發布
          </label>
          <button>儲存課程 →</button>
        </div>
      </div>
      <div className="editor-fields-panel">
        <div className="editor-fields">
          <label>
          所屬訓練
          <select
            name="trainingId"
            defaultValue={values.trainingId}
            disabled={Boolean(values.id)}
            required
          >
            {trainings.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          {values.id && (
            <input type="hidden" name="trainingId" value={values.trainingId} />
          )}
          </label>
          <label>
          父課程
          <select name="parentId" defaultValue={values.parentId ?? ""}>
            <option value="">無（根課程）</option>
            {availableParents
              .filter((item) => item.trainingId === values.trainingId && item.id !== values.id)
              .map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
          <small>設為某課程的子課程</small>
          </label>
          <label>
          課程名稱
          <input name="title" defaultValue={values.title} required />
          <small>公開網址會依課程名稱自動產生</small>
          </label>
          <label>
          講師
          <input name="instructor" defaultValue={values.instructor} required />
          </label>
          <label>
          排序
          <input
            name="order"
            type="number"
            min="0"
            defaultValue={values.order ?? 0}
            required
          />
          </label>
        </div>
        <div className="editor-long-fields">
          <label className="tags-wide">
            標籤
            <TagInput name="tags" initialValue={values.tags} suggestions={tagSuggestions}/>
          </label>
          <label className="wide">
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
      {!values.id && <NewCourseAttachments />}
    </form>
  );
}
