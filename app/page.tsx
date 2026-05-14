"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ContextForm from "@/components/ContextForm";
import AnalysisResult from "@/components/AnalysisResult";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [context, setContext] = useState<ContextData>(defaultContext);
  const [analysisContent, setAnalysisContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContent = analysisContent.length > 0 || isStreaming || error;

  const handleAnalyze = async () => {
    setAnalysisContent("");
    setError(null);
    setIsStreaming(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      formData.append("context", JSON.stringify(context));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = `Request failed with status ${response.status}`;
        try {
          const json = await response.json();
          if (json.error) errMsg = json.error;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnalysisContent((prev) => prev + chunk);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setContext(defaultContext);
    setAnalysisContent("");
    setError(null);
    setIsStreaming(false);
  };

  const canAnalyze = !isStreaming;

  return (
    <div className="min-h-screen bg-[#0A0F0A]">
      {/* Background texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyRDUwMTYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0tNiA2djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {/* ── HEADER ── */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#2D5016] rounded-2xl mb-4 shadow-lg shadow-[#2D5016]/30">
            <span className="text-5xl" role="img" aria-label="gorilla">🦍</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8F5E9] mb-2 tracking-tight">
            Gorilla Marketing{" "}
            <span className="text-[#F5A623]">Guru</span>
          </h1>
          <p className="text-[#6B9E2E] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Drop a photo of your business location and get street-smart,
            AI-powered guerrilla marketing tactics — instantly.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {["Zero BS", "Hyper-Tactical", "Instantly Actionable"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-semibold bg-[#2D5016]/60 text-[#6B9E2E] rounded-full border border-[#2D5016]"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* ── MAIN CARD ── */}
        <div className="bg-[#0D150D] border border-[#2D5016] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Card top accent */}
          <div className="h-1 bg-gradient-to-r from-[#2D5016] via-[#6B9E2E] to-[#F5A623]" />

          <div className="p-6 sm:p-8 space-y-8">

            {/* Upload Zone */}
            <section>
              <h2 className="text-[#F5A623] font-bold text-lg flex items-center gap-2 mb-4">
                <span>📸</span>
                <span>Upload Your Location</span>
                <span className="text-xs font-normal text-[#6B9E2E]/60 ml-1">(optional)</span>
              </h2>
              <UploadZone
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </section>

            {/* Divider */}
            <div className="border-t border-[#2D5016]/60" />

            {/* Context Form */}
            <section>
              <ContextForm
                context={context}
                onChange={setContext}
                disabled={isStreaming}
              />
            </section>

            {/* Divider */}
            <div className="border-t border-[#2D5016]/60" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`
                  flex-1 flex items-center justify-center gap-2
                  py-4 px-8 rounded-xl font-bold text-lg
                  transition-all duration-200
                  ${canAnalyze
                    ? "bg-[#2D5016] hover:bg-[#3a6820] text-[#E8F5E9] shadow-lg shadow-[#2D5016]/40 hover:shadow-[#2D5016]/60 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-[#2D5016]/30 text-[#6B9E2E]/40 cursor-not-allowed"
                  }
                `}
              >
                {isStreaming ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>🦍</span>
                    <span>Go Gorilla Mode!</span>
                  </>
                )}
              </button>

              {hasContent && !isStreaming && (
                <button
                  onClick={handleReset}
                  className="sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm border border-[#2D5016] text-[#6B9E2E] hover:bg-[#2D5016]/20 transition-all duration-200"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── ANALYSIS RESULT ── */}
        {hasContent && (
          <div className="mt-8">
            <AnalysisResult
              content={analysisContent}
              isStreaming={isStreaming}
              error={error}
            />
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="mt-12 text-center text-[#2D5016] text-xs space-y-1">
          <p>Powered by Claude AI • Gorilla Marketing Guru</p>
          <p>Upload any business location photo for instant guerrilla marketing tactics</p>
        </footer>
      </div>
    </div>
  );
}
