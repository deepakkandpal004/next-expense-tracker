'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[90vh] bg-gray-50 dark:bg-theme-deep text-gray-800 dark:text-gray-200 flex flex-row items-stretch font-sans overflow-hidden'>
      {/* LEFT COLUMN: Clean, premium Login Form */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative'>
        {/* Glow Backdrops */}
        <div className='glow-bg w-[300px] h-[300px] bg-theme-cyan/5 dark:bg-theme-cyan/3 top-10 left-10 animate-pulse-slow'></div>
        <div className='glow-bg w-[300px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/2 bottom-10 right-10 animate-pulse-slow' style={{ animationDelay: '-4s' }}></div>

        <div className='max-w-md w-full mx-auto space-y-8 relative z-10 animate-float-short'>
          {/* Header */}
          <div className='space-y-3'>
            <Link href='/' className='inline-flex items-center gap-2 group text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-theme-cyan dark:hover:text-cyan-400 transition-colors'>
              <span className='group-hover:-translate-x-1 transition-transform'>←</span> Back to home
            </Link>
            <div className='w-12 h-12 bg-gradient-to-br from-theme-cyan via-theme-muted to-theme-dark rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-theme-cyan/20'>
              💰
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Sign In
            </h2>
            <p className='text-sm text-gray-500 dark:text-gray-450 font-medium'>
              Unlock intelligent AI financial tracking.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {error && (
              <div className='bg-red-50/80 dark:bg-red-950/20 border-l-4 border-l-red-500 p-3.5 rounded-r-2xl text-xs font-bold text-red-800 dark:text-red-400 shadow-inner flex items-center gap-2'>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

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
                className='w-full px-4 py-3 bg-white/70 dark:bg-theme-dark/60 border border-gray-200 dark:border-white/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-theme-cyan/15 focus:bg-white dark:focus:bg-theme-deep focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm transition-all duration-200'
                required
                disabled={isLoading}
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex justify-between items-center'>
                <label htmlFor='password' className='block text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
                  Password
                </label>
              </div>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full px-4 py-3 bg-white/70 dark:bg-theme-dark/60 border border-gray-200 dark:border-white/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-theme-cyan/15 focus:bg-white dark:focus:bg-theme-deep focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm transition-all duration-200'
                required
                disabled={isLoading}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full relative group overflow-hidden bg-gradient-to-r from-theme-cyan via-theme-muted to-theme-dark hover:from-purple-700 hover:to-theme-magenta text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
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

      {/* RIGHT COLUMN: Premium interactive Visual Dashboard Showcase */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950/60 p-12 items-center justify-center relative border-l border-gray-200 dark:border-white/5/10 dark:border-white/5/30 overflow-hidden'>
        {/* Glow Spheres */}
        <div className='absolute w-[400px] h-[400px] bg-theme-cyan/15 rounded-full blur-[90px] -top-10 -right-10 animate-pulse-slow'></div>
        <div className='absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] -bottom-10 -left-10 animate-pulse-slow' style={{ animationDelay: '-3s' }}></div>

        {/* Visual elements */}
        <div className='relative z-10 w-full max-w-lg space-y-8'>
          {/* Main Visual Card Container */}
          <div className='bg-white/5 dark:bg-theme-dark/40 backdrop-blur-xl border border-white/10 dark:border-white/5/50 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden group'>
            {/* Top Stats Cards */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white/5 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:translate-y-[-2px]'>
                <p className='text-[10px] uppercase font-bold text-gray-400 tracking-wider'>Net Wealth</p>
                <p className='text-xl font-extrabold text-white mt-1'>₹1,240,000</p>
                <p className='text-[10px] font-bold text-theme-cyan flex items-center gap-1 mt-1'>
                  <span>▲</span> +12.4% this month
                </p>
              </div>
              <div className='bg-white/5 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:translate-y-[-2px]'>
                <p className='text-[10px] uppercase font-bold text-gray-400 tracking-wider'>Savings Rate</p>
                <p className='text-xl font-extrabold text-white mt-1'>42.6%</p>
                <p className='text-[10px] font-bold text-indigo-400 flex items-center gap-1 mt-1'>
                  <span>★</span> Target 45%
                </p>
              </div>
            </div>

            {/* Budget Limit Card */}
            <div className='bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3'>
              <div className='flex justify-between items-center text-xs font-bold'>
                <span className='text-white'>Monthly Budget Progress</span>
                <span className='text-theme-cyan'>₹37,000 / ₹50,000</span>
              </div>
              <div className='w-full h-3 bg-theme-dark rounded-full overflow-hidden p-[2px] border border-white/5'>
                <div className='h-full bg-gradient-to-r from-theme-cyan to-theme-muted rounded-full' style={{ width: '74%' }}></div>
              </div>
              <p className='text-[10px] text-gray-400 font-semibold'>You have ₹13,000 remaining for the next 12 days.</p>
            </div>

            {/* AI Advisor Card */}
            <div className='bg-gradient-to-br from-theme-cyan/20 via-theme-dark/20 to-transparent border border-theme-cyan/20 rounded-2xl p-5 space-y-3 relative group-hover:border-emerald-500/35 transition-all duration-300'>
              <div className='flex items-center gap-2 text-xs font-bold text-theme-cyan'>
                <span className='text-base'>🧠</span>
                <span>AI Financial Advisor</span>
                <span className='ml-auto bg-theme-cyan/25 text-cyan-300 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse'>Live</span>
              </div>
              <p className='text-xs text-gray-200 leading-relaxed font-semibold italic'>
                &ldquo;You spent ₹3,200 less on dining this week! At this rate, you will hit your savings goal 4 days earlier than expected. Consider placing ₹2,000 into your investment bucket.&rdquo;
              </p>
            </div>
          </div>

          {/* Testimonial taglines */}
          <div className='text-center space-y-2 px-6'>
            <h3 className='text-lg font-bold text-white tracking-tight'>Smart Insights, Powerful Controls</h3>
            <p className='text-xs text-gray-400 leading-relaxed max-w-sm mx-auto font-medium'>
              Join users who use ExpenseTracker AI to automate tracking, optimize budgets, and grow their wealth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
