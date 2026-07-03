import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F2EDE4] flex flex-col">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#D0C4B8]">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Ape Marketer" width={32} height={32} />
          <span className="font-display font-extrabold text-lg text-[#0D0D0D]">
            APE <span className="text-[#E05C0A]">MARKETER</span>
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display font-extrabold text-4xl text-[#0D0D0D] mb-2 leading-none">
            GET <span className="text-[#E05C0A]">STARTED</span>
          </h1>
          <p className="text-[#6B5F57] text-sm mb-8">Create your free account.</p>
          <SignUp
            forceRedirectUrl="/app"
            appearance={{
              elements: {
                card: "shadow-none border border-[#D0C4B8] rounded-lg bg-[#FDFAF6]",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-[#D0C4B8] bg-white hover:bg-[#F2EDE4] text-[#0D0D0D] font-semibold rounded",
                formButtonPrimary: "bg-[#111111] hover:bg-[#2a2a2a] text-[#F2EDE4] font-bold tracking-widest uppercase text-xs rounded",
                footerActionLink: "text-[#E05C0A] hover:text-[#c94f08]",
                formFieldInput: "border-[#D0C4B8] bg-white rounded focus:border-[#111111] focus:ring-0",
                formFieldLabel: "text-[#0D0D0D] font-semibold text-xs uppercase tracking-widest",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
