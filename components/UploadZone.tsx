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

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
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
      maxSize: 20 * 1024 * 1024,
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
          ${isDragReject ? "border-red-400 bg-red-50" : ""}
          ${isDragActive && !isDragReject ? "border-[#3D7018] bg-[#E4EFD8]" : ""}
          ${!isDragActive && !isDragReject ? "border-[#C5DBAA] hover:border-[#3D7018] hover:bg-[#F0F7EA] bg-[#F9FBF7]" : ""}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4">
            {preview ? (
              <div className="relative w-full max-h-64 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded-lg object-contain border border-[#C5DBAA]"
                />
              </div>
            ) : isVideo ? (
              <div className="flex items-center justify-center w-24 h-24 bg-[#E4EFD8] rounded-xl border border-[#C5DBAA]">
                <svg className="w-10 h-10 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-[#E4EFD8] rounded-xl border border-[#C5DBAA]">
                <svg className="w-10 h-10 text-[#2D5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="text-center">
              <p className="text-[#1A2710] font-medium text-sm truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-[#4D6B38] text-xs mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Remove file</span>
            </button>

            <p className="text-[#8AAD6A] text-xs">
              Click or drop to replace
            </p>
          </div>
        ) : (
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
                    Drag & drop your photo or video
                  </p>
                  <p className="text-[#8AAD6A] text-sm">
                    or click to browse files
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["JPG", "PNG", "WebP", "GIF", "MP4", "MOV"].map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 text-xs bg-[#E4EFD8] text-[#2D5016] rounded border border-[#C5DBAA]"
                >
                  {fmt}
                </span>
              ))}
            </div>

            <p className="text-[#8AAD6A] text-xs">Max file size: 20MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
