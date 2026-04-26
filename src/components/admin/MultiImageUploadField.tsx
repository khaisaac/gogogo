"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MultiImageUploadField.module.css";

type MultiImageUploadFieldProps = {
  id: string;
  name: string;
  currentImages?: string[];
  currentImagesFieldName?: string;
  maxFiles?: number;
};

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;

export default function MultiImageUploadField({
  id,
  name,
  currentImages = [],
  currentImagesFieldName,
  maxFiles = 10,
}: MultiImageUploadFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  return (
    <div className={styles.wrapper}>
      {currentImagesFieldName ? (
        <input
          type="hidden"
          name={currentImagesFieldName}
          value={currentImages.join("\n")}
        />
      ) : null}

      <p className={styles.helperText}>
        Current images will stay and new uploads will be added. Max total: {maxFiles} photos. Each file max 2MB.
      </p>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        multiple
        className={styles.input}
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          const oversized = files.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
          const validBySize = files.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
          const totalSelectedBytes = validBySize.reduce(
            (sum, file) => sum + file.size,
            0,
          );
          const validByTotal =
            totalSelectedBytes > MAX_TOTAL_UPLOAD_BYTES
              ? (() => {
                  let runningTotal = 0;
                  return validBySize.filter((file) => {
                    if (runningTotal + file.size > MAX_TOTAL_UPLOAD_BYTES) {
                      return false;
                    }
                    runningTotal += file.size;
                    return true;
                  });
                })()
              : validBySize;
          const remainingSlots = Math.max(0, maxFiles - currentImages.length);
          const acceptedFiles = validByTotal.slice(0, remainingSlots);

          setSelectedFiles(acceptedFiles);

          const messages: string[] = [];
          if (oversized.length > 0) {
            messages.push(`${oversized.length} file(s) skipped: each image must be smaller than 2MB.`);
          }
          if (totalSelectedBytes > MAX_TOTAL_UPLOAD_BYTES) {
            messages.push("Total new uploads are capped at 4MB per submit.");
          }
          if (validByTotal.length > acceptedFiles.length) {
            messages.push(`Only ${remainingSlots} new photo(s) accepted. Total gallery limit is ${maxFiles}.`);
          }
          setNotice(messages.length > 0 ? messages.join(" ") : null);
        }}
      />

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

      {previewUrls.length > 0 ? (
        <div className={styles.sectionBlock}>
          <p className={styles.sectionLabel}>New Uploads</p>
          <div className={styles.grid}>
            {previewUrls.map((src, index) => (
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
              setSelectedFiles([]);
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
