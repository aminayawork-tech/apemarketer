import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#0D0D0D]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#D0C4B8]">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ape Marketer" width={36} height={36} priority />
          <span className="font-display font-extrabold text-xl tracking-tight">
            APE <span className="text-[#E05C0A]">MARKETER</span>
          </span>
        </div>
        <Link
          href="/app"
          className="px-5 py-2 bg-[#111111] text-[#F2EDE4] font-bold text-xs tracking-widest uppercase rounded hover:bg-[#2a2a2a] transition-colors"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-20">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {["Gorilla Marketing Guru", "AI-Powered", "Zero BS"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs font-bold tracking-widest uppercase bg-[#111111] text-[#F2EDE4] rounded-sm">
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="font-display font-extrabold leading-none mb-6"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", letterSpacing: "-0.02em" }}
            >
              GORILLA<br />
              <span className="text-[#E05C0A]">MARKETING</span><br />
              INTELLIGENCE.
            </h1>

            <p className="text-[#6B5F57] text-lg leading-relaxed max-w-lg mb-10">
              Drop photos of your business location. Get hyper-tactical, street-smart guerrilla marketing strategies — instantly. No fluff, no agency fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#111111] text-[#F2EDE4] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#2a2a2a] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Analyze Your Location
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#D0C4B8] text-[#0D0D0D] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#EAE3D8] transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero visual — mock analysis card */}
          <div className="flex-shrink-0 md:w-[400px]">
            <div className="bg-[#FDFAF6] border border-[#D0C4B8] rounded-lg overflow-hidden shadow-sm">
              <div className="h-1 bg-[#E05C0A]" />
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/logo.png" alt="" width={20} height={20} />
                  <span className="text-xs font-bold tracking-widest uppercase text-[#A09590]">Sample Analysis</span>
                </div>
                {[
                  { label: "Top Tactic", value: "Sidewalk chalk QR campaign targeting lunch crowd" },
                  { label: "Best Time", value: "Thursday 11am–2pm · Friday evening" },
                  { label: "Budget", value: "$0–$50 · Zero ad spend required" },
                  { label: "Expected Lift", value: "+20–35% foot traffic in 2 weeks" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#F2EDE4] rounded p-3 border border-[#E0D8CF]">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#A09590] mb-1">{item.label}</p>
                    <p className="text-sm text-[#0D0D0D] leading-snug">{item.value}</p>
                  </div>
                ))}
                <div className="pt-1">
                  <div className="w-full h-9 bg-[#111111] rounded flex items-center justify-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#F2EDE4]">3 Priority Actions →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-[#D0C4B8]" />

      {/* How It Works */}
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
            <div key={f.step} className="bg-[#111111] rounded-lg p-6">
              <span className="font-display font-extrabold text-5xl text-[#E05C0A] opacity-40 leading-none block mb-4">{f.step}</span>
              <h3 className="font-display font-extrabold text-2xl text-[#F2EDE4] mb-3">{f.title}</h3>
              <p className="text-[#A09590] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#D0C4B8]" />

      {/* Tags */}
      <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
        {["Guerrilla Marketing", "Zero Ad Spend", "Local Business", "Foot Traffic", "Street-Level Tactics", "AI Analysis", "Instant Results"].map((t) => (
          <span key={t} className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase border border-[#D0C4B8] text-[#6B5F57] rounded-sm">
            {t}
          </span>
        ))}
      </section>

      <div className="border-t border-[#D0C4B8]" />

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto text-center">
        <h2
          className="font-display font-extrabold leading-none mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
        >
          READY TO GO<br />
          <span className="text-[#E05C0A]">GUERRILLA?</span>
        </h2>
        <p className="text-[#6B5F57] mb-10 text-lg max-w-md mx-auto">
          Free to use. No account required. Start analyzing your location in seconds.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-10 py-4 bg-[#111111] text-[#F2EDE4] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#2a2a2a] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Analyze My Location
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D0C4B8] px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ape Marketer" width={24} height={24} />
          <span className="font-display font-extrabold text-sm text-[#A09590]">APE <span className="text-[#E05C0A]">MARKETER</span></span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#A09590]">
          <Link href="/privacy" className="hover:text-[#0D0D0D] transition-colors">Privacy Policy</Link>
          <Link href="/app" className="hover:text-[#0D0D0D] transition-colors">Launch App</Link>
        </div>
      </footer>

    </div>
  );
}
