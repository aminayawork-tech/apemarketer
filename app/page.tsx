"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
      <div className="max-w-3xl mx-auto px-4 py-8 pb-28">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Ape Marketer"
              width={72}
              height={72}
              priority
              className="flex-shrink-0"
            />
            <h1
              className="font-display font-extrabold text-[#0D0D0D] leading-none"
              style={{ fontSize: "clamp(2.5rem, 10vw, 5rem)", letterSpacing: "-0.02em" }}
            >
              APE <span className="text-[#E05C0A]">MARKETER</span>
            </h1>
          </div>

          <div className="border-t border-[#0D0D0D] mb-4" />

          <div className="flex items-center gap-2 flex-wrap mb-0">
            {["Gorilla Marketing Guru", "AI-Powered", "Zero BS"].map((tag) => (
              <span key={tag} className="px-2.5 py-1 text-xs font-bold tracking-widest uppercase bg-[#111111] text-[#F2EDE4] rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        </header>


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
                        <Image src="/logo.png" alt="" width={22} height={22} className="animate-pulse" />
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

      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#2a2a2a] flex safe-area-inset-bottom">
        {(["analyze", "saved", "stories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 ${
              activeTab === tab ? "text-[#E05C0A]" : "text-[#6B5F57] hover:text-[#A09590]"
            }`}
          >
            {tab === "analyze" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {tab === "saved" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
            {tab === "stories" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
            <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              {tab === "analyze" && "Analyze"}
              {tab === "stories" && "Stories"}
              {tab === "saved" && (
                <>
                  Saved
                  {savedAnalyses.length > 0 && (
                    <span className="bg-[#E05C0A] text-white text-[9px] px-1 py-0.5 rounded-sm font-bold leading-none">
                      {savedAnalyses.length}
                    </span>
                  )}
                </>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
