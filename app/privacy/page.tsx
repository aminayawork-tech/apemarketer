import Link from "next/link";

export const metadata = { title: "Privacy Policy – Ape Marketer" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold tracking-widest uppercase text-[#A09590] hover:text-[#0D0D0D] transition-colors">
            ← Back
          </Link>
        </div>

        <h1 className="font-display font-extrabold text-[#0D0D0D] text-5xl mb-2 leading-none">
          PRIVACY <span className="text-[#E05C0A]">POLICY</span>
        </h1>
        <div className="border-t border-[#0D0D0D] mb-8 mt-4" />

        <div className="space-y-6 text-[#0D0D0D] text-sm leading-relaxed">
          <p className="text-[#6B5F57]">Last updated: July 2025</p>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">What We Collect</h2>
            <p>When you use Ape Marketer, we process the photos and business context you submit in order to generate marketing analysis. This data is sent to our AI provider (Anthropic) and is not stored on our servers after your session ends.</p>
          </section>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">Local Storage</h2>
            <p>Saved analyses are stored locally in your browser using localStorage. This data never leaves your device unless you explicitly export it.</p>
          </section>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">No Account Required</h2>
            <p>Ape Marketer does not require you to create an account. We do not collect your name, email address, or any personal identifiers.</p>
          </section>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">Third-Party Services</h2>
            <p>We use Anthropic&apos;s Claude API to process your requests. Anthropic&apos;s privacy policy applies to data processed through their API. We do not share your data with any other third parties.</p>
          </section>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">Cookies</h2>
            <p>We do not use tracking cookies or analytics. The only browser storage we use is localStorage for your saved analyses.</p>
          </section>

          <section>
            <h2 className="font-bold uppercase tracking-widest text-xs text-[#A09590] mb-2">Contact</h2>
            <p>Questions about privacy? Reach out at <a href="mailto:hello@apemarketer.app" className="text-[#E05C0A] hover:underline">hello@apemarketer.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
