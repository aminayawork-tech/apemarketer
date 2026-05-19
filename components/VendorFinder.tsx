"use client";

import { useState } from "react";

interface VendorFinderProps {
  brief: string;
}

const SEARCHES = [
  { label: "Print Shops", query: "print shop near me" },
  { label: "Sign & Banner", query: "vinyl banner sign shop near me" },
  { label: "Graphic Design", query: "graphic design print near me" },
];

export default function VendorFinder({ brief }: VendorFinderProps) {
  const [state, setState] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const locate = () => {
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setState("done");
      },
      () => setState("error"),
      { timeout: 10000 }
    );
  };

  const openMaps = (query: string) => {
    if (coords) {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.lat},${coords.lng},14z`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        "_blank"
      );
    }
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "idle") {
    return (
      <button
        onClick={locate}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#E05C0A]/40 text-[#E05C0A] text-xs font-bold tracking-widest uppercase hover:bg-[#E05C0A]/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Find Local Print &amp; Sign Shops
      </button>
    );
  }

  if (state === "locating") {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 py-3 text-[#E05C0A] text-xs">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Getting your location...</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-[#A09590] text-xs text-center">Location unavailable — searching without it.</p>
        <div className="grid gap-2">
          {SEARCHES.map((s) => (
            <button
              key={s.label}
              onClick={() => openMaps(s.query)}
              className="flex items-center justify-between w-full px-4 py-2.5 bg-[#1a1a1a] rounded border border-[#2a2a2a] hover:border-[#E05C0A]/40 text-[#F2EDE4] text-sm transition-colors group"
            >
              <span>{s.label}</span>
              <svg className="w-3.5 h-3.5 text-[#6B5F57] group-hover:text-[#E05C0A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // done — show search buttons + copy brief
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[#E05C0A] text-xs font-bold tracking-widest uppercase">Find Nearby</p>
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

      <div className="grid gap-2">
        {SEARCHES.map((s) => (
          <button
            key={s.label}
            onClick={() => openMaps(s.query)}
            className="flex items-center justify-between w-full px-4 py-3 bg-[#1a1a1a] rounded border border-[#2a2a2a] hover:border-[#E05C0A]/40 text-[#F2EDE4] text-sm transition-colors group"
          >
            <div className="text-left">
              <p className="font-semibold group-hover:text-[#E05C0A] transition-colors">{s.label}</p>
              <p className="text-[#6B5F57] text-xs mt-0.5">Opens Google Maps near you</p>
            </div>
            <svg className="w-4 h-4 text-[#6B5F57] group-hover:text-[#E05C0A] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        ))}
      </div>

      <p className="text-[#6B5F57] text-[10px] text-center leading-relaxed">
        Copy the brief above before calling — paste it to get an instant quote.
      </p>
    </div>
  );
}
