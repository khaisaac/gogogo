"use client";

import { useEffect, useRef, useState } from "react";
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
};

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

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
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadedUrls.length === 0) {
      return;
    }

    const maxNewUploads = Math.max(0, maxFiles - currentImages.length);
    if (uploadedUrls.length > maxNewUploads) {
      setUploadedUrls((current) => current.slice(0, maxNewUploads));
    }
  }, [currentImages.length, maxFiles, uploadedUrls]);

  const mergedImages = [...currentImages, ...uploadedUrls].slice(0, maxFiles);

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
        Current images will stay and new uploads will be added. Max total: {maxFiles} photos. Each file max 4MB.
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
            maxFiles - currentImages.length - uploadedUrls.length,
          );
          const acceptedFiles = validBySize.slice(0, remainingSlots);

          const messages: string[] = [];
          if (oversized.length > 0) {
            messages.push(`${oversized.length} file(s) skipped: each image must be smaller than 4MB.`);
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
                const payload = new FormData();
                payload.append("file", file);
                payload.append("folder", folder);

                const response = await fetch("/api/admin/uploads", {
                  method: "POST",
                  body: payload,
                });
                const data = await parseUploadResponse(response);

                if (!response.ok || !data.url) {
                  throw new Error(data.error || `Failed to upload ${file.name}`);
                }

                newUrls.push(String(data.url));
              } catch {
                failedNames.push(file.name || "unknown file");
              }
            }

            setUploadedUrls((current) => {
              const merged = [...current, ...newUrls];
              return merged.slice(0, Math.max(0, maxFiles - currentImages.length));
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

      {currentImages.length > 0 ? (
        <div className={styles.sectionBlock}>
          <p className={styles.sectionLabel}>Current</p>
          <div className={styles.grid}>
            {currentImages.map((src, index) => (
              <div key={`${src}-${index}`} className={styles.card}>
                <img
                  src={src}
                  alt={`Current gallery ${index + 1}`}
                  className={styles.img}
                />
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
