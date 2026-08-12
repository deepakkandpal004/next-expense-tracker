import Link from 'next/link';
import Image from 'next/image';
import { PUBLIC_NAVIGATION } from '../public-navigation';

export function PublicFooter() {
  return (
    <footer className="flex w-full flex-col justify-end overflow-hidden bg-black px-4 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap justify-between gap-y-12 lg:gap-x-8">
          {/* Brand */}
          <div className="flex w-full flex-col items-start text-left md:w-[45%] lg:w-[35%]">
            <Link href="/" className="group inline-flex items-center gap-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70">
              <span className="grid size-14 place-items-center overflow-hidden rounded-2xl transition-transform duration-300 group-hover:scale-110">
                <Image src="/logo1.png" alt="" width={56} height={56} className="h-full w-full object-cover" />
              </span>
              <span className="font-extrabold text-xl tracking-wider">
                <span className="text-white">Expense Tracker </span>
                <span className="text-[#00DCE5]">AI</span>
              </span>
            </Link>
            <div className="mt-8 h-0.5 w-full max-w-52 bg-gradient-to-r from-[#24212D] to-[#24212D]/0" />
            <p className="mt-6 max-w-[350px] text-sm leading-relaxed text-white/60">
              Expense Tracker AI is a growing collection of beautifully designed, production-ready
              expense tracking components with AI-powered insights.
            </p>
          </div>

          {/* Important links */}
          <div className="flex w-[45%] flex-col items-start text-left md:w-[45%] lg:w-[15%]">
            <h3 className="text-sm font-medium text-white">Important Links</h3>
            <div className="mt-6 flex flex-col gap-2">
              {PUBLIC_NAVIGATION.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-[#00DCE5]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="flex w-[45%] flex-col items-start text-left md:w-[45%] lg:w-[15%]">
            <h3 className="text-sm font-medium text-white">Social Links</h3>
            <div className="mt-6 flex flex-col gap-2">
              <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">Twitter</a>
              <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">Instagram</a>
              <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">Youtube</a>
              <a href="#" className="text-sm text-white/60 transition-colors hover:text-white">Linkedin</a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="mb-4 mt-16 h-0.5 w-full bg-gradient-to-r from-[#24212D]/0 via-[#24212D] to-[#24212D]/0" />

        {/* Bottom bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-y-4 gap-x-2 sm:flex-row">
          <p className="text-xs text-white/60">&copy; {new Date().getFullYear()} Expense Tracker AI</p>
          <div className="flex items-center gap-6 text-right">
            <a href="#" className="text-xs text-white/60 transition-colors hover:text-white">Terms &amp; Conditions</a>
            <div className="h-4 w-px bg-white/20" />
            <Link href="/privacy" className="text-xs text-white/60 transition-colors hover:text-white">Privacy Policy</Link>
          </div>
        </div>

        {/* Watermark */}
        <div className="mt-6 flex w-full justify-center md:mt-12">
          <h1 className="pointer-events-none w-full select-none text-center font-extrabold leading-[0.9] tracking-tighter text-zinc-900 text-[clamp(2.75rem,9vw,9rem)]">
            Expense Tracker AI
          </h1>
        </div>
      </div>
    </footer>
  );
}