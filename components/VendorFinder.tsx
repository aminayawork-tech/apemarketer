"use client";

import { useState } from "react";

interface Vendor {
  name: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  ratingsTotal?: number;
  openNow?: boolean | null;
  lat?: number;
  lng?: number;
}

interface VendorFinderProps {
  brief: string;
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
      (err) => {
        setErrorMsg(err.message ?? "Location access denied");
        setState("error");
      },
      { timeout: 10000 }
    );
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapsUrl = (v: Vendor) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " " + v.address)}`;

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
        Find Local Print &amp; Sign Shops
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
        <span>{state === "locating" ? "Getting your location..." : "Finding nearby vendors..."}</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-red-400 text-xs text-center">{errorMsg}</p>
        <button onClick={() => setState("idle")} className="w-full text-xs text-[#A09590] underline text-center">Try again</button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[#E05C0A] text-xs font-bold tracking-widest uppercase">Nearby Vendors</p>
        <button
          onClick={copyBrief}
          className="flex items-center gap-1.5 text-xs text-[#A09590] hover:text-[#F2EDE4] transition-colors"
        >
          {copied ? (
            <><svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400">Copied!</span></>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>Copy Brief</span></>
          )}
        </button>
      </div>

      {vendors.length === 0 ? (
        <p className="text-[#A09590] text-xs text-center py-2">No vendors found nearby. Try expanding your search area.</p>
      ) : (
        <div className="space-y-2">
          {vendors.map((v, i) => (
            <a
              key={i}
              href={mapsUrl(v)}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a] hover:border-[#E05C0A]/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[#F2EDE4] text-sm font-semibold truncate group-hover:text-[#E05C0A] transition-colors">{v.name}</p>
                  <p className="text-[#6B5F57] text-xs mt-0.5 leading-snug">{v.address}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {v.phone && (
                      <a
                        href={`tel:${v.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#E05C0A] text-xs hover:underline"
                      >
                        {v.phone}
                      </a>
                    )}
                    {v.rating && (
                      <span className="text-[#A09590] text-xs">★ {v.rating} ({v.ratingsTotal})</span>
                    )}
                    {v.openNow === true && <span className="text-green-400 text-xs">Open now</span>}
                    {v.openNow === false && <span className="text-red-400 text-xs">Closed</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-[#6B5F57] flex-shrink-0 mt-0.5 group-hover:text-[#E05C0A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      <button onClick={() => setState("idle")} className="w-full text-xs text-[#6B5F57] hover:text-[#A09590] transition-colors text-center pt-1">
        Search again
      </button>
    </div>
  );
}
