"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const CACHE_KEY = "gmg_stories_v1";
const SAVED_KEY = "gmg_saved_stories_v1";

interface ParsedStory {
  title: string;
  content: string;
}

interface SavedStory extends ParsedStory {
  id: string;
  savedAt: string;
  generatedDate: string;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function parseStories(markdown: string): ParsedStory[] {
  // Split on horizontal rules (--- on its own line)
  const blocks = markdown.split(/\n---+\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const titleMatch = block.match(/^##\s+(.+)$/m);
    return {
      title: titleMatch ? titleMatch[1].trim() : "Story",
      content: block,
    };
  });
}

function StoryCard({
  story,
  onSave,
  alreadySaved,
}: {
  story: ParsedStory;
  onSave: () => void;
  alreadySaved: boolean;
}) {
  return (
    <div className="bg-white border border-[#C5DBAA] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 story-content">
        <ReactMarkdown>{story.content}</ReactMarkdown>
      </div>
      <div className="px-6 pb-5 flex justify-end border-t border-[#E4EFD8] pt-4">
        {alreadySaved ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3D7018]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3a2 2 0 00-2 2v16l7-3.5L17 21V5a2 2 0 00-2-2H5z" />
            </svg>
            Saved
          </span>
        ) : (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#2D5016] border border-[#C5DBAA] rounded-xl hover:bg-[#E4EFD8] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save Story
          </button>
        )}
      </div>
    </div>
  );
}

function SavedStoryCard({ story, onDelete }: { story: SavedStory; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white border border-[#C5DBAA] rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A2710] text-sm truncate">{story.title}</h3>
          <p className="text-xs text-[#8AAD6A] mt-0.5">Saved from {formatDate(story.generatedDate)}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-600 font-medium">Remove?</span>
              <button onClick={onDelete} className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded-lg">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#4D6B38] border border-[#C5DBAA] px-2 py-1 rounded-lg">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-[#4D6B38] hover:bg-[#E4EFD8] rounded-lg transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#E4EFD8] p-5 story-content">
          <ReactMarkdown>{story.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function Stories() {
  const [rawContent, setRawContent] = useState("");
  const [stories, setStories] = useState<ParsedStory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cachedDate, setCachedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    // Load saved stories
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed: SavedStory[] = JSON.parse(raw);
        setSavedStories(parsed);
      }
    } catch { /* ignore */ }

    // Load or generate today's stories
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { date, content } = JSON.parse(cached);
        if (date === getTodayKey()) {
          setRawContent(content);
          setStories(parseStories(content));
          setCachedDate(date);
          return;
        }
      }
    } catch { /* ignore */ }

    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep savedIds in sync for quick lookup
  useEffect(() => {
    const ids = new Set(savedStories.map((s) => s.title + s.generatedDate));
    setSavedIds(ids);
  }, [savedStories]);

  const generate = async () => {
    setRawContent("");
    setStories([]);
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
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setRawContent(full);
      }

      const today = getTodayKey();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, content: full }));
      setCachedDate(today);
      setStories(parseStories(full));
    } catch {
      setError("Failed to generate stories. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStory = (story: ParsedStory) => {
    const today = getTodayKey();
    const newSaved: SavedStory = {
      ...story,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      generatedDate: today,
    };
    const updated = [newSaved, ...savedStories];
    setSavedStories(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedStories.filter((s) => s.id !== id);
    setSavedStories(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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
                Inspired by Jay Conrad Levinson. Three fresh stories every day — save the ones that spark ideas.
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isGenerating && !rawContent && (
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

      {/* Streaming: show raw markdown until parsing is ready */}
      {isGenerating && rawContent && (
        <div className="bg-white border border-[#C5DBAA] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 story-content">
            <ReactMarkdown>{rawContent}</ReactMarkdown>
            <span className="inline-block w-0.5 h-4 bg-[#3D7018] animate-pulse ml-0.5 align-middle" />
          </div>
        </div>
      )}

      {/* Parsed story cards (shown after streaming completes) */}
      {!isGenerating && stories.length > 0 && stories.map((story, i) => {
        const saveKey = story.title + (cachedDate ?? "");
        return (
          <StoryCard
            key={i}
            story={story}
            onSave={() => handleSaveStory(story)}
            alreadySaved={savedIds.has(saveKey)}
          />
        );
      })}

      {/* Saved Stories section */}
      {savedStories.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#E4EFD8] rounded-xl font-semibold text-sm text-[#2D5016] hover:bg-[#d8eacc] transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3a2 2 0 00-2 2v16l7-3.5L17 21V5a2 2 0 00-2-2H5z" />
              </svg>
              Saved Stories ({savedStories.length})
            </span>
            <svg className={`w-4 h-4 transition-transform duration-200 ${showSaved ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSaved && (
            <div className="space-y-2">
              {savedStories.map((story) => (
                <SavedStoryCard
                  key={story.id}
                  story={story}
                  onDelete={() => handleDeleteSaved(story.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
