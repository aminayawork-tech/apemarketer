"use client";

import ReactMarkdown from "react-markdown";

interface AnalysisResultProps {
  content: string;
  isStreaming: boolean;
  error?: string | null;
}

export default function AnalysisResult({
  content,
  isStreaming,
  error,
}: AnalysisResultProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-red-700 font-bold mb-1">Analysis Failed</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-[#8AAD6A] text-xs mt-2">
              Check your API key and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!content && !isStreaming) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-[#B8680A] font-bold text-lg">
          Analysis
        </h2>

        {isStreaming && (
          <div className="flex items-center gap-2 text-[#3D7018] text-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#3D7018] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#3D7018] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#3D7018] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs">Analyzing...</span>
          </div>
        )}
      </div>

      <div className="relative rounded-xl border border-[#C5DBAA] bg-white p-6 overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#3D7018] to-transparent opacity-60" />

        {content ? (
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-[#3D7018] animate-blink ml-0.5 align-middle" />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#E4EFD8] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#2D5016] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-[#E4EFD8] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#E4EFD8] rounded animate-pulse w-1/2" />
              </div>
            </div>
            {[80, 60, 90, 70, 50].map((width, i) => (
              <div
                key={i}
                className="h-3 bg-[#E4EFD8] rounded animate-pulse"
                style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {!isStreaming && content && (
        <p className="text-center text-[#8AAD6A] text-xs">
          Ready for your next photo — upload another location to keep the momentum going.
        </p>
      )}
    </div>
  );
}
