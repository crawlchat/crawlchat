import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/components/settings-section";
import { useFetcherToast } from "~/components/use-fetcher-toast";

export function UploadSettings() {
  const uploadFetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useFetcherToast(uploadFetcher, {
    title: "Files added to queue",
  });

  useEffect(() => {
    if (uploadFetcher.data?.success && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadFetcher.state, uploadFetcher.data]);

  return (
    <SettingsSection
      id="upload-files"
      fetcher={uploadFetcher}
      title="Upload files"
      description="Upload additional files to add to this knowledge group. Supported formats: PDF, DOCX, PPTX, TXT, MD, and code files."
      multipart
    >
      <input type="hidden" name="intent" value="upload-files" />
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        className="file-input w-full"
        accept={
          "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown,text/javascript,application/javascript,.tsx,.ts,.js,.jsx,.mdx"
        }
        multiple
      />
    </SettingsSection>
  );
}
