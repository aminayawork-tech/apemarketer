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
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="text-red-400 font-bold mb-1">Analysis Failed</h3>
            <p className="text-red-300/80 text-sm">{error}</p>
            <p className="text-[#6B9E2E]/60 text-xs mt-2">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#F5A623] font-bold text-lg flex items-center gap-2">
          <span>🦍</span>
          <span>Gorilla Analysis</span>
        </h2>

        {isStreaming && (
          <div className="flex items-center gap-2 text-[#6B9E2E] text-sm">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-[#6B9E2E] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-[#6B9E2E] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-[#6B9E2E] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-xs">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Content box */}
      <div className="relative rounded-xl border border-[#2D5016] bg-[#0D150D] p-6 overflow-hidden">
        {/* Subtle gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6B9E2E] to-transparent opacity-60" />

        {/* Markdown content */}
        {content ? (
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-[#6B9E2E] animate-blink ml-0.5 align-middle" />
            )}
          </div>
        ) : (
          /* Loading placeholder while waiting for first token */
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#2D5016]/50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg animate-pulse">🦍</span>
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-[#2D5016]/40 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#2D5016]/30 rounded animate-pulse w-1/2" />
              </div>
            </div>
            {[80, 60, 90, 70, 50].map((width, i) => (
              <div
                key={i}
                className="h-3 bg-[#2D5016]/30 rounded animate-pulse"
                style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer message when done */}
      {!isStreaming && content && (
        <p className="text-center text-[#6B9E2E]/50 text-xs">
          Ready for your next photo — upload another location to keep the momentum going! 🦍
        </p>
      )}
    </div>
  );
}
