'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay — real implementation would call an API
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className='min-h-[90vh] bg-gray-50 dark:bg-theme-deep text-gray-800 dark:text-gray-200 flex flex-row items-stretch font-sans overflow-hidden'>
      {/* LEFT COLUMN: Forgot Password Form */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative'>
        {/* Glow Backdrops */}
        <div className='glow-bg w-[300px] h-[300px] bg-theme-cyan/5 dark:bg-theme-cyan/3 top-10 left-10 animate-pulse-slow'></div>
        <div className='glow-bg w-[300px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/2 bottom-10 right-10 animate-pulse-slow' style={{ animationDelay: '-4s' }}></div>

        <div className='max-w-md w-full mx-auto space-y-8 relative z-10'>
          {/* Header */}
          <div className='space-y-3'>
            <Link href='/sign-in' className='inline-flex items-center gap-2 group text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-theme-cyan dark:hover:text-cyan-400 transition-colors'>
              <span className='group-hover:-translate-x-1 transition-transform'>←</span> Back to sign in
            </Link>
            <div className='flex items-center gap-3 mb-2'>
              <img src='/icon.png' alt='Expense Logo' width={40} height={40} className='h-10 w-10 object-contain filter brightness-100 dark:brightness-110 rounded-xl' />
              <span className='font-sora font-extrabold text-2xl text-gray-900 dark:text-gray-100 tracking-tight select-none'>
                Expense <span className='text-[#5BC0BE]'>AI</span>
              </span>
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Forgot Password
            </h2>
            <p className='text-sm text-gray-500 dark:text-gray-450 font-medium'>
              Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          {!submitted ? (
            /* Reset Form */
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-1.5'>
                <label htmlFor='email' className='block text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  className='w-full px-4 py-3 bg-white/70 dark:bg-theme-dark/60 border border-gray-200 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-theme-cyan/15 focus:bg-white dark:focus:bg-theme-deep focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm transition-all duration-200'
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-5 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl border border-theme-cyan/20 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer'
              >
                {isLoading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-[#0b132b]/30 border-t-[#0b132b] rounded-full animate-spin'></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className='space-y-6'>
              <div className='bg-theme-cyan/10 dark:bg-theme-cyan/10 border border-theme-cyan/30 dark:border-theme-cyan/20 rounded-2xl p-6 text-center space-y-3'>
                <div className='w-14 h-14 bg-theme-cyan/15 dark:bg-theme-cyan/20 rounded-2xl flex items-center justify-center mx-auto border border-theme-cyan/20'>
                  <span className='text-2xl'>📬</span>
                </div>
                <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Check your inbox!</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed'>
                  If <span className='font-bold text-gray-800 dark:text-gray-200'>{email}</span> is registered,
                  you&apos;ll receive a password reset link shortly.
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500 font-medium'>
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <button
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className='w-full py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-bold border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200'
                >
                  Try a different email
                </button>
                <Link
                  href='/sign-in'
                  className='w-full py-3 rounded-2xl bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] text-sm font-bold text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='text-center pt-2'>
            <p className='text-sm font-semibold text-gray-500 dark:text-gray-450'>
              Don&apos;t have an account?{' '}
              <Link href='/sign-up' className='text-theme-cyan dark:text-cyan-400 hover:underline font-bold'>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visual Showcase */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950/60 p-12 items-center justify-center relative border-l border-gray-200 dark:border-white/10 overflow-hidden'>
        {/* Glow Spheres */}
        <div className='absolute w-[400px] h-[400px] bg-theme-cyan/15 rounded-full blur-[90px] -top-10 -right-10 animate-pulse-slow'></div>
        <div className='absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] -bottom-10 -left-10 animate-pulse-slow' style={{ animationDelay: '-3s' }}></div>

        <div className='relative z-10 w-full max-w-lg space-y-8 text-center'>
          <div className='w-24 h-24 bg-theme-cyan/10 border border-theme-cyan/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-xl'>
            <span className='text-4xl'>🔐</span>
          </div>
          <div className='space-y-3'>
            <h3 className='text-2xl font-bold text-white tracking-tight'>Secure Password Reset</h3>
            <p className='text-sm text-gray-400 leading-relaxed max-w-xs mx-auto font-medium'>
              Your account security is our top priority. Reset links are valid for 24 hours and can only be used once.
            </p>
          </div>

          {/* Security tips */}
          <div className='space-y-3 text-left'>
            {[
              { icon: '🛡️', text: 'Links expire after 24 hours' },
              { icon: '🔒', text: 'Each link is single-use only' },
              { icon: '📧', text: 'Sent only to verified emails' },
            ].map((tip, i) => (
              <div key={i} className='flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3'>
                <span className='text-lg'>{tip.icon}</span>
                <span className='text-sm font-semibold text-gray-300'>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
