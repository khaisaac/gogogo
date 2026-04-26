"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ImageUploadField.module.css";

type ImageUploadFieldProps = {
  id: string;
  name: string;
  currentImage?: string | null;
  currentImageFieldName?: string;
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

export default function ImageUploadField({
  id,
  name,
  currentImage,
  currentImageFieldName,
  folder = "packages",
}: ImageUploadFieldProps) {
  const [uploadedUrl, setUploadedUrl] = useState(currentImage || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedUrl(currentImage || "");
  }, [currentImage]);

  const previewUrl = uploadedUrl || "";

  return (
    <div className={styles.wrapper}>
      {currentImageFieldName ? (
        <input
          type="hidden"
          name={currentImageFieldName}
          value={uploadedUrl}
        />
      ) : null}

      <input
        ref={inputRef}
        id={id}
        name={`${name}_local`}
        type="file"
        accept="image/*"
        className={styles.input}
        disabled={isUploading}
        onChange={async (event) => {
          const file = event.target.files?.[0] || null;
          if (!file) return;

          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setError("Image must be smaller than 10MB.");
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            return;
          }

          setError("");
          setIsUploading(true);

          try {
            const payload = new FormData();
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
              throw new Error(data.error || "Failed to upload image");
            }

            const supabase = createClient();
            const { error: uploadError } = await supabase.storage
              .from(String(data.bucket))
              .uploadToSignedUrl(String(data.path), String(data.token), file);

            if (uploadError) {
              throw new Error(uploadError.message || "Failed to upload image");
            }

            setUploadedUrl(String(data.publicUrl));
          } catch (uploadError) {
            const message =
              uploadError instanceof Error
                ? uploadError.message
                : "Failed to upload image";
            setError(message);
          } finally {
            setIsUploading(false);
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }
        }}
      />

      {error ? <p className={styles.previewLabel}>{error}</p> : null}
      {isUploading ? <p className={styles.previewLabel}>Uploading image...</p> : null}

      {previewUrl ? (
        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>Current image</p>
          <img
            src={previewUrl}
            alt="Image preview"
            className={styles.previewImage}
          />
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setUploadedUrl("");
              setError("");
            }}
          >
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  );
}
