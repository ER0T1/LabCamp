-- Reference checks run by URL before an uploaded file is removed from storage.
CREATE INDEX "Attachment_url_idx" ON "Attachment"("url");
