"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const STORY_PREFIX = "ape_story_v2_";
const SAVED_KEY = "ape_saved_stories_v2";

interface ParsedStory {
  title: string;
  content: string;
}

interface DayEntry {
  date: string;
  dayName: string;
  story: ParsedStory | null;
}

interface SavedStory extends ParsedStory {
  id: string;
  savedAt: string;
  date: string;
  dayName: string;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekDates(): { date: string; dayName: string }[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const fromMon = dow === 0 ? 6 : dow - 1;
  const result: { date: string; dayName: string }[] = [];
  for (let i = 0; i <= fromMon; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - fromMon + i);
    result.push({ date: d.toISOString().split("T")[0], dayName: DAY_NAMES[i] });
  }
  return result;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function parseStory(block: string): ParsedStory {
  const titleMatch = block.match(/^##\s+(.+)$/m);
  return {
    title: titleMatch ? titleMatch[1].trim() : "Story",
    content: block.trim(),
  };
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function DayStoryCard({
  entry,
  onSave,
  saved,
  isStreaming,
}: {
  entry: DayEntry;
  onSave: () => void;
  saved: boolean;
  isStreaming?: boolean;
}) {
  const isToday = entry.date === getTodayStr();

  return (
    <div className="bg-[#FDFAF6] border border-[#D0C4B8] rounded-lg overflow-hidden">
      <div className={`px-5 pt-3 pb-3 flex items-center gap-2 border-b ${isToday ? "border-[#E05C0A]/30" : "border-[#EAE3D8]"}`}>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${isToday ? "text-[#E05C0A]" : "text-[#A09590]"}`}>
          {entry.dayName}
        </span>
        <span className="text-[#D0C4B8] text-[10px]">·</span>
        <span className="text-[10px] text-[#A09590]">{formatShortDate(entry.date)}</span>
        {isToday && (
          <span className="ml-auto text-[9px] font-bold text-[#E05C0A] bg-[#E05C0A]/10 px-1.5 py-0.5 rounded tracking-widest uppercase">
            Today
          </span>
        )}
      </div>

      {entry.story ? (
        <>
          <div className="p-5 sm:p-6 story-content">
            <ReactMarkdown>{entry.story.content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-[#E05C0A] animate-pulse ml-0.5 align-middle" />
            )}
          </div>
          {!isStreaming && (
            <div className="px-5 pb-4 flex justify-end border-t border-[#E0D8CF] pt-3">
              {saved ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#111111] uppercase tracking-wide">
                  <svg className="w-4 h-4 text-[#E05C0A]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3a2 2 0 00-2 2v16l7-3.5L17 21V5a2 2 0 00-2-2H5z" />
                  </svg>
                  Saved
                </span>
              ) : (
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#111111] border border-[#D0C4B8] rounded hover:bg-[#EAE3D8] hover:border-[#111111] transition-colors uppercase tracking-wide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save Story
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="p-5 space-y-2">
          {[90, 75, 85, 60, 80].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-[#EAE3D8] rounded animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          ))}
          <p className="text-[10px] text-[#A09590] pt-1">Writing...</p>
        </div>
      )}
    </div>
  );
}

function SavedStoryCard({ story, onDelete }: { story: SavedStory; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-[#FDFAF6] border border-[#D0C4B8] rounded-lg overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#0D0D0D] text-sm truncate">{story.title}</h3>
          <p className="text-xs text-[#A09590] mt-0.5">
            {story.dayName} · {formatShortDate(story.date)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-600 font-medium">Remove?</span>
              <button onClick={onDelete} className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#6B5F57] border border-[#D0C4B8] px-2 py-1 rounded">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-[#A09590] hover:text-[#0D0D0D] hover:bg-[#EAE3D8] rounded transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[#E0D8CF] p-5 story-content">
          <ReactMarkdown>{story.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function Stories() {
  const [days, setDays] = useState<DayEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingDayIndex, setStreamingDayIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSavedStories(JSON.parse(raw));
    } catch { /* ignore */ }

    const weekDates = getWeekDates();
    const loaded: DayEntry[] = weekDates.map(({ date, dayName }) => {
      try {
        const cached = localStorage.getItem(STORY_PREFIX + date);
        if (cached) return { date, dayName, story: JSON.parse(cached) };
      } catch { /* ignore */ }
      return { date, dayName, story: null };
    });

    setDays(loaded);

    const missing = loaded.filter((d) => !d.story);
    if (missing.length > 0) {
      generateStories(missing, loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSavedIds(new Set(savedStories.map((s) => `${s.date}_${s.title}`)));
  }, [savedStories]);

  const generateStories = async (
    targets: { date: string; dayName: string }[],
    currentDays: DayEntry[]
  ) => {
    setIsGenerating(true);
    setError(null);

    const dateLabels = targets.map((t) => `${t.dayName} (${t.date})`);

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: dateLabels }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error ?? `API error ${response.status}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let completedCount = 0;

      // Track which target we're currently streaming into
      setStreamingDayIndex(currentDays.findIndex((d) => d.date === targets[0]?.date));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;

        // Check for completed stories as we stream (look for --- separator)
        const blocks = full.split(/\n---+\n/);
        const newlyCompleted = blocks.length - 1; // last block may be incomplete

        if (newlyCompleted > completedCount) {
          // New stories have completed
          for (let i = completedCount; i < newlyCompleted && i < targets.length; i++) {
            const story = parseStory(blocks[i]);
            const target = targets[i];
            localStorage.setItem(STORY_PREFIX + target.date, JSON.stringify(story));
            setDays((prev) =>
              prev.map((d) => (d.date === target.date ? { ...d, story } : d))
            );
          }
          completedCount = newlyCompleted;
          // Update streaming indicator to next target
          if (completedCount < targets.length) {
            setStreamingDayIndex(
              currentDays.findIndex((d) => d.date === targets[completedCount]?.date)
            );
          }
        }
      }

      // Handle the last block (no trailing ---)
      const finalBlocks = full.split(/\n---+\n/).map((b) => b.trim()).filter(Boolean);
      if (finalBlocks.length > completedCount && completedCount < targets.length) {
        const story = parseStory(finalBlocks[completedCount]);
        const target = targets[completedCount];
        localStorage.setItem(STORY_PREFIX + target.date, JSON.stringify(story));
        setDays((prev) =>
          prev.map((d) => (d.date === target.date ? { ...d, story } : d))
        );
      }
    } catch {
      setError("Failed to generate stories. Please try again.");
    } finally {
      setIsGenerating(false);
      setStreamingDayIndex(-1);
    }
  };

  const handleSave = (entry: DayEntry) => {
    if (!entry.story) return;
    const newSaved: SavedStory = {
      ...entry.story,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      date: entry.date,
      dayName: entry.dayName,
    };
    const updated = [newSaved, ...savedStories];
    setSavedStories(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = savedStories.filter((s) => s.id !== id);
    setSavedStories(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const dayNumber = days.length; // how many days shown this week
  const totalDots = 7;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#111111] rounded-lg overflow-hidden">
        <div className="h-1 bg-[#E05C0A]" />
        <div className="p-6">
          <p className="text-xs font-bold tracking-widest uppercase text-[#6B5F57] mb-1">
            Daily Inspiration
          </p>
          <h2
            className="font-display font-extrabold text-[#F2EDE4] leading-none mb-3"
            style={{ fontSize: "clamp(1.75rem, 7vw, 2.75rem)", letterSpacing: "-0.02em" }}
          >
            APE MARKETER<br />
            <span className="text-[#E05C0A]">STORIES</span>
          </h2>

          {/* Week progress */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: totalDots }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < dayNumber
                      ? i === dayNumber - 1
                        ? "bg-[#E05C0A]"
                        : "bg-[#6B5F57]"
                      : "bg-[#2a2a2a]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#A09590]">
              Day {dayNumber} of 7
              <span className="text-[#6B5F57]"> · resets Monday</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Daily story cards */}
      {days.map((entry, i) => (
        <DayStoryCard
          key={entry.date}
          entry={entry}
          onSave={() => handleSave(entry)}
          saved={savedIds.has(`${entry.date}_${entry.story?.title ?? ""}`)}
          isStreaming={isGenerating && i === streamingDayIndex}
        />
      ))}

      {/* Saved stories */}
      {savedStories.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#111111] rounded-lg font-bold text-xs text-[#F2EDE4] hover:bg-[#1a1a1a] transition-colors uppercase tracking-widest"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#E05C0A]" fill="currentColor" viewBox="0 0 24 24">
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
                  onDelete={() => handleDelete(story.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
