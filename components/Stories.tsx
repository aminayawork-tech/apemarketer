"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const CACHE_KEY = "gmg_stories_v1";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function Stories() {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cachedDate, setCachedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { date, stories } = JSON.parse(cached);
        if (date === getTodayKey()) {
          setContent(stories);
          setCachedDate(date);
          return;
        }
      }
    } catch { /* ignore */ }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setContent("");
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toDateString() }),
      });

      if (!response.ok || !response.body) throw new Error("Request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setContent(fullContent);
      }

      const today = getTodayKey();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, stories: fullContent }));
      setCachedDate(today);
    } catch {
      setError("Failed to generate stories. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white border border-[#C5DBAA] rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#2D5016] via-[#3D7018] to-[#B8680A]" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-[#B8680A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 className="text-xl font-extrabold text-[#1A2710]">Guerrilla Stories</h2>
              </div>
              <p className="text-[#4D6B38] text-sm leading-relaxed">
                Inspired by Jay Conrad Levinson. Five fresh stories daily — real tactics, real impact, pure inspiration.
              </p>
              {cachedDate && !isGenerating && (
                <p className="text-xs text-[#8AAD6A] mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(cachedDate)}
                </p>
              )}
            </div>

            <button
              onClick={generate}
              disabled={isGenerating}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#2D5016] border border-[#C5DBAA] bg-[#F9FBF7] rounded-xl hover:bg-[#E4EFD8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isGenerating ? "Writing..." : "New Stories"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isGenerating && !content && (
        <div className="bg-white border border-[#C5DBAA] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <div className="h-5 bg-[#E4EFD8] rounded animate-pulse w-1/2" />
            <div className="h-3 bg-[#E4EFD8] rounded animate-pulse w-1/3" />
          </div>
          <div className="space-y-2 pt-2">
            {[95, 88, 75, 90, 65, 80, 70].map((w, i) => (
              <div key={i} className="h-3 bg-[#E4EFD8] rounded animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <p className="text-xs text-[#8AAD6A] text-center pt-2">Writing today&apos;s stories...</p>
        </div>
      )}

      {/* Stories content */}
      {content && (
        <div className="bg-white border border-[#C5DBAA] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 story-content">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isGenerating && (
              <span className="inline-block w-0.5 h-4 bg-[#3D7018] animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
