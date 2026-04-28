"use client";

import { useState, useRef } from "react";
import Editor from "react-simple-wysiwyg";

type Props = {
  name: string;
  defaultValue?: string;
  id?: string;
  required?: boolean;
};

export default function RichTextEditor({ name, defaultValue, id, required }: Props) {
  const [value, setValue] = useState(defaultValue || "");
  const [copiedFormat, setCopiedFormat] = useState<Record<string, string> | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle paste as plain text
  const handlePasteAsPlainText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Insert plain text without formatting
      document.execCommand("insertText", false, text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert("Could not access clipboard. Please use Ctrl+Shift+V instead.");
    }
  };

  // Copy format (format painter)
  const handleCopyFormat = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      alert("Please select text to copy formatting from");
      return;
    }

    const element = selection.anchorNode?.parentElement as HTMLElement;
    if (!element) return;

    const styles = window.getComputedStyle(element);
    const format = {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      textDecoration: styles.textDecoration,
      color: styles.color,
    };

    setCopiedFormat(format);
    alert("Format copied! Now select text where you want to apply this format.");
  };

  // Apply copied format
  const handleApplyFormat = () => {
    if (!copiedFormat) {
      alert("No format copied. Copy a format first.");
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      alert("Please select text to apply the format to");
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontFamily = copiedFormat.fontFamily;
    span.style.fontSize = copiedFormat.fontSize;
    span.style.fontWeight = copiedFormat.fontWeight;
    span.style.fontStyle = copiedFormat.fontStyle;
    span.style.textDecoration = copiedFormat.textDecoration;
    span.style.color = copiedFormat.color;

    range.surroundContents(span);
    setCopiedFormat(null);
  };

  // Clear all formatting
  const handleClearFormatting = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      alert("Please select text to clear formatting");
      return;
    }
    document.execCommand("removeFormat", false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Toolbar buttons */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handlePasteAsPlainText}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
          title="Paste text without formatting"
        >
          📋 Paste Plain Text
        </button>
        
        <button
          type="button"
          onClick={handleCopyFormat}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: copiedFormat ? "#e3f2fd" : "#f0f0f0",
            border: copiedFormat ? "2px solid #2196F3" : "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
          title="Format Painter - Copy formatting from selected text"
        >
          🎨 Format Painter {copiedFormat ? "✓" : ""}
        </button>

        {copiedFormat && (
          <button
            type="button"
            onClick={handleApplyFormat}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#c8e6c9",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
            title="Apply copied format to selected text"
          >
            ✓ Apply Format
          </button>
        )}

        <button
          type="button"
          onClick={handleClearFormatting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
          title="Remove all formatting from selected text"
        >
          ✂️ Clear Formatting
        </button>
      </div>

      <div
        ref={editorRef}
        className="wysiwyg-content"
        style={{
          background: "white",
          color: "black",
          borderRadius: "4px",
          minHeight: "300px",
          border: "1px solid #ddd",
        }}
      >
        <Editor
          value={value}
          onChange={(e) => setValue(e.target.value)}
          containerProps={{ style: { height: "300px", overflowY: "auto" } }}
          onPaste={(e) => {
            // Optionally add paste validation here
            e.preventDefault();
            const text = e.clipboardData?.getData("text/plain");
            if (text) {
              document.execCommand("insertText", false, text);
            }
          }}
        />
      </div>
      <input type="hidden" name={name} id={id} value={value} />
    </div>
  );
}
