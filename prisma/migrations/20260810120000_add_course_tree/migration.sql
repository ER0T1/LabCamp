ALTER TABLE "Course" ADD COLUMN "parentId" TEXT;

ALTER TABLE "Course" ADD CONSTRAINT "Course_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Course"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Course_parentId_idx" ON "Course"("parentId");
