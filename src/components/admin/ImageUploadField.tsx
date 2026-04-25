"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ImageUploadField.module.css";

type ImageUploadFieldProps = {
  id: string;
  name: string;
  currentImage?: string | null;
  currentImageFieldName?: string;
};

export default function ImageUploadField({
  id,
  name,
  currentImage,
  currentImageFieldName,
}: ImageUploadFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setObjectUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const previewUrl = objectUrl || currentImage || "";

  return (
    <div className={styles.wrapper}>
      {currentImageFieldName ? (
        <input
          type="hidden"
          name={currentImageFieldName}
          value={currentImage || ""}
        />
      ) : null}

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          setSelectedFile(file);
        }}
      />

      {previewUrl ? (
        <div className={styles.previewCard}>
          <p className={styles.previewLabel}>
            {selectedFile ? "Preview upload" : "Current image"}
          </p>
          <img
            src={previewUrl}
            alt="Image preview"
            className={styles.previewImage}
          />
          {selectedFile ? (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setSelectedFile(null);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              Cancel upload
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
