import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createTraining } from "@/actions/content";
import { TrainingEditorForm } from "@/components/training-editor-form";

export default async function NewTrainingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");

  return <div className="editor-page training-editor-page">
    <div className="editor-workspace page-shell">
      <TrainingEditorForm action={createTraining}/>
    </div>
  </div>;
}
