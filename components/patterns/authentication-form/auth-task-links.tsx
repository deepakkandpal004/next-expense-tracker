import Link from 'next/link';

export function AuthTaskLinks() {
  return (
    <nav aria-label="Account tasks" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-in">
        Sign in
      </Link>
      <span className="text-white/10">|</span>
      <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-up">
        Create account
      </Link>
    </nav>
  );
}
