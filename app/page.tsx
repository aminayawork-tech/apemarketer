"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import blackLogo from "@/components/solid-silhouette--light-bg.png";
import UploadZone from "@/components/UploadZone";
import ContextForm from "@/components/ContextForm";
import AnalysisResult from "@/components/AnalysisResult";
import Chat from "@/components/Chat";
import SavedAnalyses, { SavedAnalysis } from "@/components/SavedAnalyses";
import Stories from "@/components/Stories";
import { compressImage } from "@/utils/compressImage";

interface ContextData {
  businessType: string;
  targetCustomers: string;
  goals: string;
  constraints: string;
  additionalNotes: string;
}

const defaultContext: ContextData = {
  businessType: "",
  targetCustomers: "",
  goals: "",
  constraints: "",
  additionalNotes: "",
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"analyze" | "saved" | "stories">("analyze");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [context, setContext] = useState<ContextData>(defaultContext);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("savedAnalyses");
      if (stored) setSavedAnalyses(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const hasContent = analysisContent.length > 0 || isStreaming || !!error;
  const canSave = !isStreaming && analysisContent.length > 0 && !isSaved;

  const handleAnalyze = async () => {
    setAnalysisContent("");
    setError(null);
    setIsStreaming(true);
    setIsSaved(false);

    try {
      const formData = new FormData();
      const compressed = await Promise.all(selectedFiles.map((f) => compressImage(f)));
      compressed.forEach((file, i) => formData.append(`image_${i}`, file));
      formData.append("context", JSON.stringify(context));

      const response = await fetch("/api/analyze", { method: "POST", body: formData });

      if (!response.ok) {
        let errMsg = `Request failed with status ${response.status}`;
        if (response.status === 413) errMsg = "Images are too large to send. Try fewer photos or smaller files.";
        else {
          try {
            const json = await response.json();
            if (json.error) errMsg = json.error;
          } catch { /* ignore */ }
        }
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnalysisContent((prev: string) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSave = () => {
    const title =
      context.businessType ||
      (context.additionalNotes ? context.additionalNotes.slice(0, 40) : null) ||
      `Analysis ${new Date().toLocaleDateString()}`;

    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      title,
      content: analysisContent,
      context,
      savedAt: new Date().toISOString(),
    };

    const updated = [newAnalysis, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem("savedAnalyses", JSON.stringify(updated));
    setIsSaved(true);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedAnalyses.filter((a) => a.id !== id);
    setSavedAnalyses(updated);
    localStorage.setItem("savedAnalyses", JSON.stringify(updated));
  };

  const handleEditSaved = (id: string, newTitle: string) => {
    const updated = savedAnalyses.map((a) => (a.id === id ? { ...a, title: newTitle } : a));
    setSavedAnalyses(updated);
    localStorage.setItem("savedAnalyses", JSON.stringify(updated));
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setContext(defaultContext);
    setAnalysisContent("");
    setError(null);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#A09590] uppercase mb-2">
            Gorilla Marketing Guru · AI-Powered · Zero BS
          </p>

          <div className="mb-4">
            <Image
              src={blackLogo}
              alt="Ape Marketer"
              className="w-auto h-auto max-h-28"
              priority
            />
          </div>

          <div className="border-t border-[#0D0D0D] mb-4" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[#6B5F57] text-sm leading-relaxed max-w-md">
              Drop photos of your location. Get street-smart, hyper-tactical guerrilla
              marketing — instantly.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {["Hyper-Tactical", "Actionable"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs font-bold tracking-widest uppercase bg-[#111111] text-[#F2EDE4] rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border border-[#D0C4B8] rounded-lg overflow-hidden mb-6 bg-[#FDFAF6]">
          {(["analyze", "saved", "stories"] as const).map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 text-xs font-bold tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-1.5 ${
                idx > 0 ? "border-l border-[#D0C4B8]" : ""
              } ${
                activeTab === tab
                  ? "bg-[#111111] text-[#F2EDE4]"
                  : "text-[#6B5F57] hover:text-[#0D0D0D] hover:bg-[#EAE3D8]"
              }`}
            >
              {tab === "analyze" && "Analyze"}
              {tab === "stories" && "Stories"}
              {tab === "saved" && (
                <>
                  Saved
                  {savedAnalyses.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-sm font-bold ${
                      activeTab === "saved"
                        ? "bg-[#E05C0A] text-white"
                        : "bg-[#EAE3D8] text-[#6B5F57]"
                    }`}>
                      {savedAnalyses.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {activeTab === "analyze" ? (
          <>
            <div className="bg-[#FDFAF6] border border-[#D0C4B8] rounded-lg overflow-hidden">
              <div className="h-1 bg-[#E05C0A]" />

              <div className="p-6 sm:p-8 space-y-8">
                <section>
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#A09590] mb-4">
                    Upload Location
                    <span className="font-normal ml-2 normal-case tracking-normal text-[#A09590]">· optional · up to 5 photos</span>
                  </h2>
                  <UploadZone onFilesSelect={setSelectedFiles} selectedFiles={selectedFiles} />
                </section>

                <div className="border-t border-[#E0D8CF]" />

                <section>
                  <ContextForm context={context} onChange={setContext} disabled={isStreaming} />
                </section>

                <div className="border-t border-[#E0D8CF]" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isStreaming}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded font-bold text-sm tracking-widest uppercase transition-all duration-200 ${
                      !isStreaming
                        ? "bg-[#111111] hover:bg-[#2a2a2a] text-white shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-[#D0C4B8] text-[#A09590] cursor-not-allowed"
                    }`}
                  >
                    {isStreaming ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <span>Analyze Location</span>
                    )}
                  </button>

                  {hasContent && !isStreaming && (
                    <button
                      onClick={handleReset}
                      className="sm:w-auto px-6 py-4 rounded font-semibold text-xs border border-[#D0C4B8] text-[#6B5F57] hover:bg-[#EAE3D8] transition-all duration-200 uppercase tracking-widest"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {hasContent && (
              <div className="mt-6 space-y-4">
                <AnalysisResult content={analysisContent} isStreaming={isStreaming} error={error} />

                {canSave && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#FDFAF6] border border-[#D0C4B8] text-[#111111] font-semibold text-sm rounded hover:bg-[#EAE3D8] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save Analysis
                    </button>
                  </div>
                )}

                {isSaved && (
                  <div className="flex justify-end">
                    <span className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-[#F2EDE4] font-semibold text-sm rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </span>
                  </div>
                )}

                {!isStreaming && analysisContent && !error && (
                  <Chat initialAnalysis={analysisContent} context={context} />
                )}
              </div>
            )}
          </>
        ) : activeTab === "saved" ? (
          <SavedAnalyses
            analyses={savedAnalyses}
            onDelete={handleDeleteSaved}
            onEdit={handleEditSaved}
          />
        ) : (
          <Stories />
        )}

        <footer className="mt-12 border-t border-[#D0C4B8] pt-5 flex items-center justify-between">
          <p className="text-[#A09590] text-xs tracking-widest uppercase font-semibold">Gorilla Marketing Guru</p>
          <p className="text-[#A09590] text-xs">Upload any location for instant tactics</p>
        </footer>
      </div>
    </div>
  );
}
