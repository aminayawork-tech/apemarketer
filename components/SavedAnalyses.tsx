"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface SavedAnalysis {
  id: string;
  title: string;
  content: string;
  context: {
    businessType: string;
    targetCustomers: string;
    goals: string;
    constraints: string;
    additionalNotes: string;
  };
  savedAt: string;
}

interface SavedAnalysesProps {
  analyses: SavedAnalysis[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

function AnalysisCard({
  analysis,
  onDelete,
  onEdit,
}: {
  analysis: SavedAnalysis;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(analysis.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed) onEdit(trimmed);
    else setEditTitle(analysis.title);
    setEditing(false);
  };

  const date = new Date(analysis.savedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const contextSummary = [analysis.context.businessType, analysis.context.targetCustomers]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-white border border-[#C5DBAA] rounded-xl overflow-hidden shadow-sm">
      {/* Header row */}
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setEditTitle(analysis.title);
                    setEditing(false);
                  }
                }}
                className="flex-1 border border-[#3D7018] rounded-lg px-3 py-1.5 text-sm text-[#1A2710] focus:outline-none focus:ring-1 focus:ring-[#3D7018]/40"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="text-xs font-semibold text-white bg-[#2D5016] px-3 py-1.5 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditTitle(analysis.title);
                  setEditing(false);
                }}
                className="text-xs text-[#4D6B38] border border-[#C5DBAA] px-3 py-1.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h3 className="font-semibold text-[#1A2710] truncate">{analysis.title}</h3>
          )}
          <p className="text-xs text-[#8AAD6A] mt-0.5">
            {date}
            {contextSummary && <span> · {contextSummary}</span>}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Edit button */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-[#4D6B38] hover:bg-[#E4EFD8] rounded-lg transition-colors"
              title="Edit title"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Delete button */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-600 font-medium">Delete?</span>
              <button
                onClick={onDelete}
                className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded-lg"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-[#4D6B38] border border-[#C5DBAA] px-2 py-1 rounded-lg"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-[#4D6B38] hover:bg-[#E4EFD8] rounded-lg transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[#E4EFD8] p-4">
          {(analysis.context.goals || analysis.context.constraints || analysis.context.additionalNotes) && (
            <div className="mb-4 p-3 bg-[#F5F7F4] rounded-lg text-xs space-y-1">
              {analysis.context.goals && (
                <p className="text-[#4D6B38]">
                  <span className="font-semibold uppercase tracking-wider text-[#2D5016]">Goals: </span>
                  {analysis.context.goals}
                </p>
              )}
              {analysis.context.constraints && (
                <p className="text-[#4D6B38]">
                  <span className="font-semibold uppercase tracking-wider text-[#2D5016]">Constraints: </span>
                  {analysis.context.constraints}
                </p>
              )}
              {analysis.context.additionalNotes && (
                <p className="text-[#4D6B38]">
                  <span className="font-semibold uppercase tracking-wider text-[#2D5016]">Notes: </span>
                  {analysis.context.additionalNotes}
                </p>
              )}
            </div>
          )}
          <div className="markdown-content">
            <ReactMarkdown>{analysis.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedAnalyses({ analyses, onDelete, onEdit }: SavedAnalysesProps) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#E4EFD8] rounded-2xl mb-4">
          <svg className="w-7 h-7 text-[#3D7018]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <p className="text-[#1A2710] font-semibold mb-1">No saved analyses yet</p>
        <p className="text-[#8AAD6A] text-sm">Run an analysis and click Save to store it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <AnalysisCard
          key={analysis.id}
          analysis={analysis}
          onDelete={() => onDelete(analysis.id)}
          onEdit={(title) => onEdit(analysis.id, title)}
        />
      ))}
    </div>
  );
}
