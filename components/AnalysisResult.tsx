"use client";

import Image from "next/image";
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-red-700 font-bold text-sm mb-1 uppercase tracking-wide">Analysis Failed</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-[#A09590] text-xs mt-2">Check your API key and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content && !isStreaming) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#A09590]">
          Analysis
        </h2>
        {isStreaming && (
          <div className="flex items-center gap-2 text-[#E05C0A] text-xs">
            <Image src="/logo.png" alt="" width={18} height={18} className="animate-pulse" />
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#E05C0A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#E05C0A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#E05C0A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="relative rounded-lg border border-[#D0C4B8] bg-[#FDFAF6] p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E05C0A]" />

        {content ? (
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-blink ml-0.5 align-middle" />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded bg-[#EAE3D8] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#A09590] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-[#EAE3D8] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[#EAE3D8] rounded animate-pulse w-1/2" />
              </div>
            </div>
            {[80, 60, 90, 70, 50].map((width, i) => (
              <div
                key={i}
                className="h-3 bg-[#EAE3D8] rounded animate-pulse"
                style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {!isStreaming && content && (
        <p className="text-center text-[#A09590] text-xs">
          Ready for your next location — upload another photo to keep the momentum going.
        </p>
      )}
    </div>
  );
}
