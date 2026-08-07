import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { PUBLIC_DISCLOSURE_NAVIGATION, PUBLIC_NAVIGATION, SUPPORT_EMAIL, SUPPORT_EMAIL_ALT } from './public-navigation';

export function PublicFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.06] bg-black">
      {/* Subtle gradient glow at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/20 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-0 size-[420px] rounded-full bg-[#00DCE5]/[0.035] blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[360px] rounded-full bg-[#A855F7]/[0.035] blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080C11]">
              <span className="grid size-14 place-items-center rounded-2xl overflow-hidden -mr-1 transition-transform duration-300 group-hover:scale-110">
                <Image src="/logo1.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
              </span>
              <span className="font-extrabold text-xl tracking-wider">
                <span className="text-white">Expense </span>
                <span className="text-[#00DCE5]">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#9AA3AF]">
              Smart expense tracking with AI-powered insights to help you understand and manage your finances.
            </p>
            <div className="mt-6 inline-flex flex-col items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <span className="flex items-center gap-2 text-xs font-medium text-[#C7CDD6]">
                <ShieldCheck size={15} className="text-[#22C55E]" />
                Built for clearer money days
              </span>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#00DCE5] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
              >
                Start tracking for free
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation" className="lg:col-span-2">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-[#9AA3AF]/70">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {PUBLIC_NAVIGATION.filter(item => !['sign-in', 'get-started'].includes(item.id)).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[#9AA3AF] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-[#9AA3AF]/70">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="group inline-flex items-center gap-2 text-sm font-medium text-[#9AA3AF] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]">
                  <Mail size={14} className="text-[#00DCE5]/70 transition-colors group-hover:text-[#00DCE5]" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL_ALT}`} className="group inline-flex items-center gap-2 text-sm font-medium text-[#9AA3AF] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]">
                  <Mail size={14} className="text-[#00DCE5]/70 transition-colors group-hover:text-[#00DCE5]" />
                  {SUPPORT_EMAIL_ALT}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-[#9AA3AF]/70">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {PUBLIC_DISCLOSURE_NAVIGATION.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[#9AA3AF] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 sm:flex-row">
          <p className="text-xs font-medium text-[#9AA3AF]/55">
            &copy; {new Date().getFullYear()} Expense AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs font-medium text-[#9AA3AF]/55 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]">
              Privacy
            </Link>
            <Link href="/ai-transparency" className="text-xs font-medium text-[#9AA3AF]/55 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]">
              AI transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
