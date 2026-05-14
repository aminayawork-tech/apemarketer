"use client";

import { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import ContextForm from "@/components/ContextForm";
import AnalysisResult from "@/components/AnalysisResult";
import Chat from "@/components/Chat";
import SavedAnalyses, { SavedAnalysis } from "@/components/SavedAnalyses";
import Stories from "@/components/Stories";

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
      selectedFiles.forEach((file, i) => formData.append(`image_${i}`, file));
      formData.append("context", JSON.stringify(context));

      const response = await fetch("/api/analyze", { method: "POST", body: formData });

      if (!response.ok) {
        let errMsg = `Request failed with status ${response.status}`;
        try {
          const json = await response.json();
          if (json.error) errMsg = json.error;
        } catch { /* ignore */ }
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
    <div className="min-h-screen bg-[#F5F7F4]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2D5016] rounded-2xl mb-4 shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A2710] mb-2 tracking-tight">
            Gorilla Marketing <span className="text-[#B8680A]">Guru</span>
          </h1>
          <p className="text-[#4D6B38] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Drop photos of your business location and get street-smart,
            AI-powered guerrilla marketing tactics — instantly.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {["Zero BS", "Hyper-Tactical", "Instantly Actionable"].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs font-semibold bg-[#E4EFD8] text-[#2D5016] rounded-full border border-[#C5DBAA]">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#E4EFD8] rounded-xl mb-6">
          {(["analyze", "saved", "stories"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === tab ? "bg-white text-[#1A2710] shadow-sm" : "text-[#4D6B38] hover:text-[#1A2710]"
              }`}
            >
              {tab === "analyze" && "Analyze"}
              {tab === "stories" && "Stories"}
              {tab === "saved" && (
                <>
                  Saved
                  {savedAnalyses.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === "saved" ? "bg-[#E4EFD8] text-[#2D5016]" : "bg-[#C5DBAA] text-[#2D5016]"
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
            {/* Main Card */}
            <div className="bg-white border border-[#C5DBAA] rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#2D5016] via-[#3D7018] to-[#B8680A]" />

              <div className="p-6 sm:p-8 space-y-8">
                <section>
                  <h2 className="text-[#B8680A] font-bold text-lg mb-4">
                    Upload Your Location
                    <span className="text-xs font-normal text-[#8AAD6A] ml-2">(optional · up to 5 photos)</span>
                  </h2>
                  <UploadZone onFilesSelect={setSelectedFiles} selectedFiles={selectedFiles} />
                </section>

                <div className="border-t border-[#E4EFD8]" />

                <section>
                  <ContextForm context={context} onChange={setContext} disabled={isStreaming} />
                </section>

                <div className="border-t border-[#E4EFD8]" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isStreaming}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 ${
                      !isStreaming
                        ? "bg-[#2D5016] hover:bg-[#3a6820] text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-[#C5DBAA] text-[#8AAD6A] cursor-not-allowed"
                    }`}
                  >
                    {isStreaming ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                      className="sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm border border-[#C5DBAA] text-[#2D5016] hover:bg-[#E4EFD8] transition-all duration-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis Result */}
            {hasContent && (
              <div className="mt-8 space-y-4">
                <AnalysisResult content={analysisContent} isStreaming={isStreaming} error={error} />

                {canSave && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#C5DBAA] text-[#2D5016] font-semibold text-sm rounded-xl hover:bg-[#E4EFD8] transition-colors shadow-sm"
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
                    <span className="flex items-center gap-2 px-5 py-2.5 bg-[#E4EFD8] text-[#2D5016] font-semibold text-sm rounded-xl">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </span>
                  </div>
                )}

                {/* Chat — only shown when analysis is complete */}
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

        <footer className="mt-12 text-center text-[#8AAD6A] text-xs">
          <p>Upload any business location photo for instant guerrilla marketing tactics</p>
        </footer>
      </div>
    </div>
  );
}
