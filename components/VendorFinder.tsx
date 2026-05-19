"use client";

import { useState } from "react";

interface Vendor {
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  phoneRaw?: string;
  url: string;
  isOpen: boolean;
  distance: number;
}

interface VendorFinderProps {
  brief: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#E05C0A] text-xs tracking-tight">
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span className="text-[#6B5F57] ml-1">{rating} ({}</span>
    </span>
  );
}

export default function VendorFinder({ brief }: VendorFinderProps) {
  const [state, setState] = useState<"idle" | "locating" | "loading" | "done" | "error">("idle");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const find = () => {
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setState("loading");
        try {
          const res = await fetch("/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: coords.latitude, lng: coords.longitude }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed");
          setVendors(data.vendors ?? []);
          setState("done");
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
          setState("error");
        }
      },
      () => {
        setErrorMsg("Location access denied — please allow location in your browser.");
        setState("error");
      },
      { timeout: 10000 }
    );
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (state === "idle") {
    return (
      <button
        onClick={find}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#E05C0A]/40 text-[#E05C0A] text-xs font-bold tracking-widest uppercase hover:bg-[#E05C0A]/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Find Local Vendors  ·  4.5★ &amp; up only
      </button>
    );
  }

  if (state === "locating" || state === "loading") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 py-3 text-[#E05C0A] text-xs">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{state === "locating" ? "Getting your location..." : "Finding top-rated vendors..."}</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-red-400 text-xs text-center px-2">{errorMsg}</p>
        <button onClick={() => setState("idle")} className="w-full text-xs text-[#A09590] hover:text-[#F2EDE4] transition-colors text-center underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[#E05C0A] text-xs font-bold tracking-widest uppercase">
          Top-Rated Nearby · 4.5★+
        </p>
        <button
          onClick={copyBrief}
          className="flex items-center gap-1.5 text-xs text-[#A09590] hover:text-[#F2EDE4] transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Brief copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Brief</span>
            </>
          )}
        </button>
      </div>

      {vendors.length === 0 ? (
        <p className="text-[#A09590] text-xs text-center py-3">
          No vendors with 4.5★+ found within 6 miles. Try a broader search.
        </p>
      ) : (
        <div className="space-y-2">
          {vendors.map((v, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#E05C0A]/30 transition-colors overflow-hidden">
              <div className="px-3 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[#F2EDE4] text-sm font-semibold leading-tight">{v.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${v.isOpen ? "bg-green-900/40 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                    {v.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[#E05C0A] text-xs">{"★".repeat(Math.floor(v.rating))}{v.rating % 1 >= 0.5 ? "·" : ""}</span>
                  <span className="text-[#F2EDE4] text-xs font-bold">{v.rating}</span>
                  <span className="text-[#6B5F57] text-xs">({v.reviewCount} reviews)</span>
                  <span className="text-[#6B5F57] text-xs">· {v.distance} mi</span>
                </div>
                <p className="text-[#6B5F57] text-xs leading-snug">{v.address}</p>
              </div>
              <div className="flex border-t border-[#2a2a2a]">
                {v.phoneRaw && (
                  <a
                    href={`tel:${v.phoneRaw}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[#E05C0A] text-xs font-bold hover:bg-[#E05C0A]/10 transition-colors border-r border-[#2a2a2a]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[#A09590] text-xs font-bold hover:bg-[#2a2a2a] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Yelp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[#6B5F57] text-[10px] text-center leading-relaxed pt-1">
        Copy the brief above before calling — paste it to get an instant quote.
      </p>
    </div>
  );
}
