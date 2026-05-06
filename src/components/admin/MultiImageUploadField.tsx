"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./MultiImageUploadField.module.css";

type MultiImageUploadFieldProps = {
  id: string;
  name: string;
  currentImages?: string[];
  currentImagesFieldName?: string;
  maxFiles?: number;
  folder?: "blog" | "packages";
};

type UploadApiResult = {
  url?: string;
  error?: string;
  bucket?: string;
  path?: string;
  token?: string;
  publicUrl?: string;
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

async function parseUploadResponse(response: Response): Promise<UploadApiResult> {
  const rawText = await response.text();
  if (!rawText) return {};

  try {
    return JSON.parse(rawText) as UploadApiResult;
  } catch {
    return { error: rawText };
  }
}

export default function MultiImageUploadField({
  id,
  name,
  currentImages = [],
  currentImagesFieldName,
  maxFiles = 10,
  folder = "packages",
}: MultiImageUploadFieldProps) {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [removedCurrentImages, setRemovedCurrentImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCurrentImages = currentImages.filter((src) => !removedCurrentImages.includes(src));

  useEffect(() => {
    if (uploadedUrls.length === 0) {
      return;
    }

    const maxNewUploads = Math.max(0, maxFiles - activeCurrentImages.length);
    if (uploadedUrls.length > maxNewUploads) {
      setUploadedUrls((current) => current.slice(0, maxNewUploads));
    }
  }, [activeCurrentImages.length, maxFiles, uploadedUrls]);

  const mergedImages = [...activeCurrentImages, ...uploadedUrls].slice(0, maxFiles);

  return (
    <div className={styles.wrapper}>
      {currentImagesFieldName ? (
        <input
          type="hidden"
          name={currentImagesFieldName}
          value={mergedImages.join("\n")}
        />
      ) : null}

      <input
        type="hidden"
        name={`${name}_uploaded_urls`}
        value={uploadedUrls.join("\n")}
      />

      <p className={styles.helperText}>
        Current images will stay and new uploads will be added. Max total: {maxFiles} photos. Each file max 10MB.
      </p>

      <input
        ref={inputRef}
        id={id}
        name={`${name}_local`}
        type="file"
        accept="image/*"
        multiple
        className={styles.input}
        disabled={isUploading}
        onChange={async (event) => {
          const files = Array.from(event.target.files || []);
          const oversized = files.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
          const validBySize = files.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
          const remainingSlots = Math.max(
            0,
            maxFiles - activeCurrentImages.length - uploadedUrls.length,
          );
          const acceptedFiles = validBySize.slice(0, remainingSlots);

          const messages: string[] = [];
          if (oversized.length > 0) {
            messages.push(`${oversized.length} file(s) skipped: each image must be smaller than 10MB.`);
          }
          if (validBySize.length > acceptedFiles.length) {
            messages.push(`Only ${remainingSlots} new photo(s) accepted. Total gallery limit is ${maxFiles}.`);
          }

          if (acceptedFiles.length === 0) {
            setNotice(messages.length > 0 ? messages.join(" ") : "No files to upload.");
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            return;
          }

          setIsUploading(true);

          try {
            const newUrls: string[] = [];
            const failedNames: string[] = [];

            for (const file of acceptedFiles) {
              try {
                const response = await fetch("/api/admin/uploads/sign", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    fileName: file.name,
                    fileSize: file.size,
                    folder,
                  }),
                });
                const data = await parseUploadResponse(response);

                if (!response.ok || !data.path || !data.token || !data.bucket || !data.publicUrl) {
                  throw new Error(data.error || `Failed to upload ${file.name}`);
                }

                const supabase = createClient();
                const { error: uploadError } = await supabase.storage
                  .from(String(data.bucket))
                  .uploadToSignedUrl(String(data.path), String(data.token), file);

                if (uploadError) {
                  throw new Error(uploadError.message || `Failed to upload ${file.name}`);
                }

                newUrls.push(String(data.publicUrl));
              } catch {
                failedNames.push(file.name || "unknown file");
              }
            }

            setUploadedUrls((current) => {
              const merged = [...current, ...newUrls];
              return merged.slice(0, Math.max(0, maxFiles - activeCurrentImages.length));
            });

            const statusMessages = [...messages];
            if (newUrls.length > 0) {
              statusMessages.push(`${newUrls.length} photo(s) uploaded.`);
            }
            if (failedNames.length > 0) {
              statusMessages.push(
                `${failedNames.length} photo(s) failed: ${failedNames.slice(0, 3).join(", ")}${failedNames.length > 3 ? ", ..." : ""}.`,
              );
            }

            setNotice(
              statusMessages.length > 0
                ? statusMessages.join(" ")
                : "Upload complete.",
            );
          } catch {
            setNotice("Failed to upload images.");
          } finally {
            setIsUploading(false);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }
        }}
      />

      {isUploading ? <p className={styles.noticeText}>Uploading images...</p> : null}

      {activeCurrentImages.length > 0 ? (
        <div className={styles.sectionBlock}>
          <p className={styles.sectionLabel}>Current</p>
          <div className={styles.grid}>
            {activeCurrentImages.map((src, index) => (
              <div key={`${src}-${index}`} className={styles.card}>
                <img
                  src={src}
                  alt={`Current gallery ${index + 1}`}
                  className={styles.img}
                />
                <button
                  type="button"
                  onClick={() => setRemovedCurrentImages([...removedCurrentImages, src])}
                  className={styles.removeBtn}
                >
                  Remove image
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {uploadedUrls.length > 0 ? (
        <div className={styles.sectionBlock}>
          <p className={styles.sectionLabel}>New Uploads</p>
          <div className={styles.grid}>
            {uploadedUrls.map((src, index) => (
              <div key={`${src}-${index}`} className={styles.card}>
                <img
                  src={src}
                  alt={`Upload preview ${index + 1}`}
                  className={styles.img}
                />
                <button
                  type="button"
                  onClick={() => setUploadedUrls(uploadedUrls.filter(url => url !== src))}
                  className={styles.removeBtn}
                >
                  Remove image
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setUploadedUrls([]);
              setNotice(null);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            Cancel all uploads
          </button>
        </div>
      ) : null}

      {notice ? <p className={styles.noticeText}>{notice}</p> : null}
    </div>
  );
}
