import Link from 'next/link';
import { PUBLIC_DISCLOSURE_NAVIGATION, PUBLIC_NAVIGATION, SUPPORT_EMAIL, SUPPORT_PHONE_LABEL } from './public-navigation';

export function PublicFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0B0F14]">
      {/* Subtle gradient glow at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg overflow-hidden bg-[#00DCE5]/10 ring-1 ring-[#00DCE5]/20">
                <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
              </span>
              <span className="text-lg font-bold text-white">Expense AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9AA3AF]">
              Smart expense tracking with AI-powered insights to help you understand and manage your finances.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9AA3AF]/60">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {PUBLIC_NAVIGATION.filter(item => !['sign-in', 'get-started'].includes(item.id)).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#9AA3AF] transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9AA3AF]/60">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-sm text-[#9AA3AF] transition-colors duration-200 hover:text-white"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+919123495043`}
                  className="text-sm text-[#9AA3AF] transition-colors duration-200 hover:text-white"
                >
                  {SUPPORT_PHONE_LABEL}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9AA3AF]/60">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {PUBLIC_DISCLOSURE_NAVIGATION.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#9AA3AF] transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-[#9AA3AF]/50">
            &copy; {new Date().getFullYear()} Expense AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-[#9AA3AF]/50 transition-colors duration-200 hover:text-[#9AA3AF]">
              Privacy
            </Link>
            <Link href="/ai-transparency" className="text-xs text-[#9AA3AF]/50 transition-colors duration-200 hover:text-[#9AA3AF]">
              AI transparency
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
