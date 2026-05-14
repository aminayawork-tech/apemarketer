"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const MAX_FILES = 5;

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

export default function UploadZone({ onFilesSelect, selectedFiles }: UploadZoneProps) {
  const [previews, setPreviews] = useState<(string | null)[]>([]);

  useEffect(() => {
    if (selectedFiles.length === 0) setPreviews([]);
  }, [selectedFiles.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = MAX_FILES - selectedFiles.length;
      const toAdd = acceptedFiles.slice(0, Math.max(0, remaining));
      if (toAdd.length === 0) return;

      const startIndex = selectedFiles.length;
      setPreviews((prev) => [...prev, ...toAdd.map(() => null)]);

      toAdd.forEach((file, relIdx) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews((prev) => {
              const updated = [...prev];
              updated[startIndex + relIdx] = e.target?.result as string;
              return updated;
            });
          };
          reader.readAsDataURL(file);
        }
      });

      onFilesSelect([...selectedFiles, ...toAdd]);
    },
    [selectedFiles, onFilesSelect]
  );

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onFilesSelect(selectedFiles.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
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
    maxSize: 20 * 1024 * 1024,
    noClick: selectedFiles.length > 0,
  });

  if (selectedFiles.length > 0) {
    return (
      <div
        {...getRootProps()}
        className={`relative rounded-xl p-4 border-2 border-dashed transition-all duration-200 ${
          isDragActive ? "border-[#3D7018] bg-[#E4EFD8]" : "border-[#C5DBAA] bg-[#F9FBF7]"
        }`}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E4EFD8]/80 rounded-xl z-10 pointer-events-none">
            <p className="text-[#2D5016] font-semibold">Drop to add</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#C5DBAA] flex-shrink-0 bg-[#E4EFD8]"
            >
              {previews[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[i]!} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {file.type.startsWith("video/") ? (
                    <svg className="w-8 h-8 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-[#8AAD6A] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              )}
              <button
                onClick={(e) => handleRemove(e, i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow hover:bg-red-600 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {selectedFiles.length < MAX_FILES && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-[#C5DBAA] flex flex-col items-center justify-center hover:border-[#3D7018] hover:bg-[#F0F7EA] transition-all text-[#8AAD6A] hover:text-[#3D7018] flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs mt-1 font-medium">{selectedFiles.length}/{MAX_FILES}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-[#8AAD6A] mt-3">
          {selectedFiles.length}/{MAX_FILES} photos · Drag anywhere to add more
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
        ${isDragReject ? "border-red-400 bg-red-50" : ""}
        ${isDragActive && !isDragReject ? "border-[#3D7018] bg-[#E4EFD8]" : ""}
        ${!isDragActive && !isDragReject ? "border-[#C5DBAA] hover:border-[#3D7018] hover:bg-[#F0F7EA] bg-[#F9FBF7]" : ""}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`transition-transform duration-200 ${isDragActive ? "scale-110" : ""}`}>
          {isDragReject ? (
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-[#8AAD6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        <div className="text-center">
          {isDragReject ? (
            <p className="text-red-500 font-medium">File type not supported</p>
          ) : isDragActive ? (
            <p className="text-[#3D7018] font-medium text-lg">Drop to upload</p>
          ) : (
            <>
              <p className="text-[#1A2710] font-medium text-lg mb-1">
                Drag & drop your photos or videos
              </p>
              <p className="text-[#8AAD6A] text-sm">or click to browse · up to 5 files</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["JPG", "PNG", "WebP", "GIF", "MP4", "MOV"].map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 text-xs bg-[#E4EFD8] text-[#2D5016] rounded border border-[#C5DBAA]">
              {fmt}
            </span>
          ))}
        </div>

        <p className="text-[#8AAD6A] text-xs">Max 20MB per file · Up to 5 files</p>
      </div>
    </div>
  );
}
