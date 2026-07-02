import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2EDE4]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ape Marketer" width={36} height={36} priority />
          <span className="font-display font-extrabold text-xl tracking-tight">
            APE <span className="text-[#E05C0A]">MARKETER</span>
          </span>
        </div>
        <Link
          href="/app"
          className="px-5 py-2 bg-[#E05C0A] text-white font-bold text-xs tracking-widest uppercase rounded hover:bg-[#c94f08] transition-colors"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-20">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#E05C0A] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#A09590]">AI-Powered · Zero BS</span>
            </div>

            <h1
              className="font-display font-extrabold leading-none mb-6"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", letterSpacing: "-0.02em" }}
            >
              GORILLA<br />
              <span className="text-[#E05C0A]">MARKETING</span><br />
              INTELLIGENCE.
            </h1>

            <p className="text-[#A09590] text-lg leading-relaxed max-w-lg mb-10">
              Drop photos of your business location. Get hyper-tactical, street-smart guerrilla marketing strategies — instantly. No fluff, no agency fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E05C0A] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#c94f08] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Analyze Your Location
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#2a2a2a] text-[#F2EDE4] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#1a1a1a] transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-shrink-0 md:w-[420px]">
            <div className="relative bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl">
              <div className="h-1 bg-[#E05C0A]" />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Image src="/logo.png" alt="" width={22} height={22} />
                  <span className="text-xs font-bold tracking-widest uppercase text-[#A09590]">Analysis</span>
                </div>
                {[
                  { label: "Top Tactic", value: "Sidewalk chalk QR campaign targeting lunch crowd" },
                  { label: "Best Time", value: "Thursday 11am–2pm · Friday evening" },
                  { label: "Budget", value: "$0–$50 · Zero ad spend required" },
                  { label: "Expected Lift", value: "+20–35% foot traffic in 2 weeks" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#A09590] mb-1">{item.label}</p>
                    <p className="text-sm text-[#F2EDE4] leading-snug">{item.value}</p>
                  </div>
                ))}
                <div className="pt-1">
                  <div className="w-full h-9 bg-[#E05C0A] rounded flex items-center justify-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-white">3 Priority Actions →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1f1f1f]" />

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#A09590] mb-12 text-center">How It Works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Drop Your Photos",
              desc: "Upload up to 5 photos of your storefront, street, or location. The more context, the sharper the tactics.",
            },
            {
              step: "02",
              title: "Add Context",
              desc: "Tell us your business type, target customers, budget, and goals. Takes 60 seconds.",
            },
            {
              step: "03",
              title: "Get Street-Smart Tactics",
              desc: "Receive a full guerrilla marketing playbook — specific, actionable, zero fluff. Instantly.",
            },
          ].map((f) => (
            <div key={f.step} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <span className="font-display font-extrabold text-5xl text-[#E05C0A] opacity-40 leading-none block mb-4">{f.step}</span>
              <h3 className="font-display font-extrabold text-2xl mb-3">{f.title}</h3>
              <p className="text-[#A09590] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1f1f1f]" />

      {/* Tags row */}
      <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
        {["Guerrilla Marketing", "Zero Ad Spend", "Local Business", "Foot Traffic", "Street-Level Tactics", "AI Analysis", "Instant Results"].map((t) => (
          <span key={t} className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase border border-[#2a2a2a] text-[#A09590] rounded-sm">
            {t}
          </span>
        ))}
      </section>

      {/* Divider */}
      <div className="border-t border-[#1f1f1f]" />

      {/* CTA banner */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto text-center">
        <h2
          className="font-display font-extrabold leading-none mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
        >
          READY TO GO<br />
          <span className="text-[#E05C0A]">GUERRILLA?</span>
        </h2>
        <p className="text-[#A09590] mb-10 text-lg max-w-md mx-auto">
          Free to use. No account required. Start analyzing your location in seconds.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-10 py-4 bg-[#E05C0A] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#c94f08] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Analyze My Location
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ape Marketer" width={24} height={24} />
          <span className="font-display font-extrabold text-sm text-[#A09590]">APE MARKETER</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#A09590]">
          <Link href="/privacy" className="hover:text-[#F2EDE4] transition-colors">Privacy Policy</Link>
          <Link href="/app" className="hover:text-[#F2EDE4] transition-colors">Launch App</Link>
        </div>
      </footer>

    </div>
  );
}
