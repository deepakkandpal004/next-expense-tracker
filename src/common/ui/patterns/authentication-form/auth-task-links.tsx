import Link from 'next/link';

export function AuthTaskLinks({ variant }: { variant: 'sign-in' | 'sign-up' }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
      {variant === 'sign-in' ? (
        <>
          <span>New here?</span>
          <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-up">
            Create account
          </Link>
        </>
      ) : (
        <>
          <span>Already have an account?</span>
          <Link className="text-primary hover:text-primary/80 transition-colors font-medium" href="/sign-in">
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}
