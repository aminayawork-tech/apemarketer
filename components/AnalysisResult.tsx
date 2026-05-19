"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface AnalysisResultProps {
  content: string;
  isStreaming: boolean;
  error?: string | null;
  onQuestionClick?: (question: string) => void;
}

function parseSections(markdown: string) {
  const parts = markdown.split(/^## /m);
  return parts.filter(Boolean).map((part) => {
    const nl = part.indexOf("\n");
    const title = nl >= 0 ? part.slice(0, nl).trim() : part.trim();
    const body = nl >= 0 ? part.slice(nl + 1).trim() : "";
    return { title, body };
  });
}

function extractQuestions(body: string): string[] {
  return body
    .split("\n")
    .map((l) => l.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter((l) => l.endsWith("?") && l.length > 8);
}

export default function AnalysisResult({
  content,
  isStreaming,
  error,
  onQuestionClick,
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

  const sections = parseSections(content);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#A09590]">Analysis</h2>
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

      {content ? (
        <div className="space-y-4">
          {sections.map(({ title, body }, i) => {
            const key = `${title}-${i}`;
            const isTop3 = /top 3 priority/i.test(title);
            const isFollowUp = /follow-up/i.test(title);

            if (isTop3) {
              return (
                <div key={key} className="rounded-lg overflow-hidden border-l-4 border-[#E05C0A] bg-[#111111]">
                  <div className="px-5 pt-4 pb-1">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#E05C0A]">
                      Top 3 Priority Actions
                    </span>
                  </div>
                  <div className="px-5 pb-5 text-[#F2EDE4] markdown-content markdown-dark">
                    <ReactMarkdown>{body}</ReactMarkdown>
                    {isStreaming && i === sections.length - 1 && (
                      <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-blink ml-0.5 align-middle" />
                    )}
                  </div>
                </div>
              );
            }

            if (isFollowUp) {
              const questions = extractQuestions(body);
              const hasQuestions = questions.length > 0;
              return (
                <div key={key} className="relative rounded-lg border border-[#D0C4B8] bg-[#FDFAF6] p-5 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E05C0A]" />
                  <p className="text-xs font-bold tracking-widest uppercase text-[#E05C0A] mb-3">Follow-up Questions</p>
                  {hasQuestions ? (
                    <div className="space-y-2">
                      {questions.map((q, qi) => (
                        <button
                          key={qi}
                          onClick={() => onQuestionClick?.(q)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-[#D0C4B8] bg-white text-[#0D0D0D] text-sm leading-snug hover:border-[#E05C0A] hover:bg-[#FFF8F4] active:scale-[0.99] transition-all duration-150 flex items-start gap-3 group"
                        >
                          <span className="text-[#E05C0A] font-bold mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">↗</span>
                          <span>{q}</span>
                        </button>
                      ))}
                      <p className="text-[10px] text-[#A09590] pt-1 text-center">Tap a question to send it to Ask the Ape</p>
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>{body}</ReactMarkdown>
                    </div>
                  )}
                  {isStreaming && i === sections.length - 1 && (
                    <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-blink ml-0.5 align-middle" />
                  )}
                </div>
              );
            }

            // Default section
            return (
              <div key={key} className="relative rounded-lg border border-[#D0C4B8] bg-[#FDFAF6] p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E05C0A]" />
                <p className="text-xs font-bold tracking-widest uppercase text-[#E05C0A] mb-3">{title}</p>
                <div className="markdown-content">
                  <ReactMarkdown>{body}</ReactMarkdown>
                  {isStreaming && i === sections.length - 1 && (
                    <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-blink ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Fallback: show raw content while streaming before first ## appears */}
          {sections.length === 0 && (
            <div className="relative rounded-lg border border-[#D0C4B8] bg-[#FDFAF6] p-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E05C0A]" />
              <div className="markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
                {isStreaming && <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-blink ml-0.5 align-middle" />}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg border border-[#D0C4B8] bg-[#FDFAF6] p-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#E05C0A]" />
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
              <div key={i} className="h-3 bg-[#EAE3D8] rounded animate-pulse" style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      )}

      {!isStreaming && content && (
        <p className="text-center text-[#A09590] text-xs">
          Ready for your next location — upload another photo to keep the momentum going.
        </p>
      )}
    </div>
  );
}
