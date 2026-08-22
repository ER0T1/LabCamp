import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { updateTraining } from "@/actions/content";
import { TrainingEditorForm } from "@/components/training-editor-form";
import { prisma } from "@/lib/prisma";

export default async function EditTrainingPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "MEMBER") redirect("/");
  const training = await prisma.training.findUnique({ where: { id: (await params).id } });
  if (!training) notFound();
  return <div className="editor-page training-editor-page">
    <div className="editor-workspace page-shell">
      <TrainingEditorForm action={updateTraining} values={training} saved={(await searchParams).saved === "1"}/>
    </div>
  </div>;
}
