"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
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
  const [chatSeed, setChatSeed] = useState<string | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

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
              className="font-display font-extrabold text-[#0D0D0D] leading-none flex-1"
              style={{ fontSize: "clamp(2.5rem, 10vw, 5rem)", letterSpacing: "-0.02em" }}
            >
              APE <span className="text-[#E05C0A]">MARKETER</span>
            </h1>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "border border-[#D0C4B8]",
                },
              }}
            />

            {/* Hamburger menu */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded hover:bg-[#E0D8CF] transition-colors"
                aria-label="Menu"
              >
                <span className="block w-5 h-[2px] bg-[#0D0D0D]" />
                <span className="block w-5 h-[2px] bg-[#0D0D0D]" />
                <span className="block w-5 h-[2px] bg-[#0D0D0D]" />
              </button>
            </div>

            {/* Bottom sheet menu */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)} />
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#A09590]">Menu</span>
                    <button onClick={() => setMenuOpen(false)} className="text-[#A09590] hover:text-[#F2EDE4] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: "Ape Marketer", text: "AI-powered guerrilla marketing for your business location.", url: "https://www.apemarketer.app" });
                      } else {
                        navigator.clipboard.writeText("https://www.apemarketer.app");
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-6 py-5 bg-[#222222] hover:bg-[#2a2a2a] transition-colors text-left"
                  >
                    <svg className="w-5 h-5 text-[#E05C0A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-[#F2EDE4] font-semibold text-base">Share Ape Marketer</span>
                  </button>

                  <a
                    href="/privacy"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-4 px-6 py-5 bg-[#222222] hover:bg-[#2a2a2a] transition-colors border-t border-[#2a2a2a]"
                  >
                    <svg className="w-5 h-5 text-[#E05C0A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[#F2EDE4] font-semibold text-base">Privacy Policy</span>
                  </a>

                  <div className="pb-8" />
                </div>
              </>
            )}
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
                <AnalysisResult content={analysisContent} isStreaming={isStreaming} error={error} onQuestionClick={(q) => { setChatSeed(q + "__" + Date.now()); }} />

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
                  <Chat initialAnalysis={analysisContent} context={context} seedInput={chatSeed} />
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
              activeTab === tab ? "text-[#E05C0A]" : "text-[#fdfaf6] hover:text-[#A09590]"
            }`}
          >
            {tab === "analyze" && (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8 V5 A1 1 0 0 1 5 4 H8" />
                <path d="M16 4 H19 A1 1 0 0 1 20 5 V8" />
                <path d="M20 16 V19 A1 1 0 0 1 19 20 H16" />
                <path d="M8 20 H5 A1 1 0 0 1 4 19 V16" />
                <line x1="3.5" y1="12" x2="20.5" y2="12" />
              </svg>
            )}
            {tab === "saved" && (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path fillRule="evenodd" d="M6 4 H18 V20 L12 16 L6 20 Z M12 8.2 L10.95 10.1 L8.95 10.4 L10.5 11.9 L10.1 14 L12 13 L13.9 14 L13.5 11.9 L15.05 10.4 L13.05 10.1 Z" />
              </svg>
            )}
            {tab === "stories" && (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3 H14 L19 8 V20 A1 1 0 0 1 18 21 H6 A1 1 0 0 1 5 20 V4 A1 1 0 0 1 6 3 Z" />
                <path d="M14 3 V8 H19" />
                <line x1="8.5" y1="13" x2="15" y2="13" />
                <line x1="8.5" y1="16.5" x2="15" y2="16.5" />
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
