"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      onFileSelect(file);

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For video or other files, just show icon
        setPreview(null);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "video/mp4": [".mp4"],
        "video/quicktime": [".mov"],
        "video/webm": [".webm"],
      },
      maxFiles: 1,
      maxSize: 20 * 1024 * 1024, // 20MB
    });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setPreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideo = selectedFile?.type.startsWith("video/");

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${isDragReject ? "border-red-500 bg-red-500/10" : ""}
          ${isDragActive && !isDragReject ? "border-[#6B9E2E] bg-[#6B9E2E]/10" : ""}
          ${!isDragActive && !isDragReject ? "border-[#2D5016] hover:border-[#6B9E2E] hover:bg-[#2D5016]/20 bg-[#0A0F0A]" : ""}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            {/* Preview */}
            {preview ? (
              <div className="relative w-full max-h-64 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded-lg object-contain border border-[#2D5016]"
                />
              </div>
            ) : isVideo ? (
              <div className="flex items-center justify-center w-24 h-24 bg-[#2D5016]/30 rounded-xl border border-[#2D5016]">
                <span className="text-5xl">🎥</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-[#2D5016]/30 rounded-xl border border-[#2D5016]">
                <span className="text-5xl">📁</span>
              </div>
            )}

            {/* File info */}
            <div className="text-center">
              <p className="text-[#E8F5E9] font-medium text-sm truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-[#6B9E2E] text-xs mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <span>✕</span>
              <span>Remove file</span>
            </button>

            <p className="text-[#6B9E2E]/60 text-xs">
              Click or drop to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Upload icon */}
            <div
              className={`
              text-6xl transition-transform duration-200
              ${isDragActive ? "scale-110" : ""}
            `}
            >
              {isDragReject ? "🚫" : isDragActive ? "📸" : "📷"}
            </div>

            <div className="text-center">
              {isDragReject ? (
                <p className="text-red-400 font-medium">
                  File type not supported
                </p>
              ) : isDragActive ? (
                <p className="text-[#6B9E2E] font-medium text-lg">
                  Drop it like it&apos;s hot! 🦍
                </p>
              ) : (
                <>
                  <p className="text-[#E8F5E9] font-medium text-lg mb-1">
                    Drag & drop your photo or video
                  </p>
                  <p className="text-[#6B9E2E]/70 text-sm">
                    or click to browse files
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["JPG", "PNG", "WebP", "GIF", "MP4", "MOV"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 text-xs bg-[#2D5016]/40 text-[#6B9E2E] rounded border border-[#2D5016]/60"
                >
                  {fmt}
                </span>
              ))}
            </div>

            <p className="text-[#6B9E2E]/50 text-xs">Max file size: 20MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
