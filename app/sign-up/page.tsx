'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-[90vh] bg-gray-50 dark:bg-theme-deep text-gray-800 dark:text-gray-200 flex flex-row items-stretch font-sans overflow-hidden'>
      {/* LEFT COLUMN: Clean, premium Signup Form */}
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
            <div className='flex items-center gap-3 mb-2'>
              <img src="/expense.png" alt="Expense Logo" className="h-10 w-auto object-contain filter brightness-100 dark:brightness-110 rounded-xl" />
              <span className='font-extrabold text-2xl text-gray-900 dark:text-gray-100 tracking-tight select-none'>
                Expense <span className='text-[#5BC0BE]'>AI</span>
              </span>
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Create Account
            </h2>
            <p className='text-sm text-gray-500 dark:text-gray-450 font-medium'>
              Start tracking your expenses with intelligent AI automation.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-50/80 dark:bg-red-950/20 border-l-4 border-l-red-500 p-3.5 rounded-r-2xl text-xs font-bold text-red-800 dark:text-red-400 shadow-inner flex items-center gap-2'>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className='space-y-1.5'>
              <label htmlFor='name' className='block text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
                Full Name
              </label>
              <input
                type='text'
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='John Doe'
                className='w-full px-4 py-3 bg-white/70 dark:bg-theme-dark/60 border border-gray-200 dark:border-white/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-theme-cyan/15 focus:bg-white dark:focus:bg-gray-950 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm transition-all duration-200'
                required
                disabled={isLoading}
              />
            </div>

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

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label htmlFor='password' className='block text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
                  Password
                </label>
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

              <div className='space-y-1.5'>
                <label htmlFor='confirmPassword' className='block text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
                  Confirm
                </label>
                <input
                  type='password'
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full px-4 py-3 bg-white/70 dark:bg-theme-dark/60 border border-gray-200 dark:border-white/5 dark:border-white/5 rounded-2xl focus:ring-4 focus:ring-theme-cyan/15 focus:bg-white dark:focus:bg-theme-deep focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm shadow-sm transition-all duration-200'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-5 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl border border-theme-cyan/20 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className='text-center pt-2'>
            <p className='text-sm font-semibold text-gray-500 dark:text-gray-450'>
              Already have an account?{' '}
              <Link href='/sign-in' className='text-theme-cyan dark:text-cyan-400 hover:underline font-bold'>
                Sign In
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
            {/* Top Title/Progress bar */}
            <div className='space-y-1.5'>
              <h4 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Intelligent Goal Tracking</h4>
              <p className='text-lg font-black text-white'>Automatic Categorization & AI advice</p>
            </div>

            {/* Categorization showcase */}
            <div className='space-y-3 bg-white/5 border border-white/5 rounded-2xl p-5'>
              <p className='text-xs font-bold text-white border-b border-white/5 pb-2'>Live Transaction Sorting</p>
              
              <div className='flex items-center gap-3 text-xs'>
                <div className='w-8 h-8 rounded-lg bg-theme-cyan/25 text-theme-cyan flex items-center justify-center text-sm font-bold'>
                  🍕
                </div>
                <div>
                  <p className='font-bold text-white'>Dominos Pizza Delivery</p>
                  <p className='text-[10px] text-gray-400'>Food & Dinings</p>
                </div>
                <span className='ml-auto font-black text-white'>-₹420.00</span>
              </div>

              <div className='flex items-center gap-3 text-xs'>
                <div className='w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold'>
                  🚕
                </div>
                <div>
                  <p className='font-bold text-white'>Uber Rides Pvt Ltd</p>
                  <p className='text-[10px] text-gray-400'>Travel & Transport</p>
                </div>
                <span className='ml-auto font-black text-white'>-₹180.00</span>
              </div>
            </div>

            {/* AI Advisor Card */}
            <div className='bg-gradient-to-br from-theme-cyan/20 via-theme-dark/20 to-transparent border border-theme-cyan/20 rounded-2xl p-5 space-y-3 relative group-hover:border-emerald-500/35 transition-all duration-300'>
              <div className='flex items-center gap-2 text-xs font-bold text-theme-cyan'>
                <span className='text-base'>🧠</span>
                <span>Smart Suggestions</span>
              </div>
              <p className='text-xs text-gray-250 leading-relaxed font-semibold italic'>
                &ldquo;We automatically sort your transactions into Food, Travel, Shopping, Bills, and others. The AI will immediately analyze your trends to present options to optimize spending.&rdquo;
              </p>
            </div>
          </div>

          {/* Testimonial taglines */}
          <div className='text-center space-y-2 px-6'>
            <h3 className='text-lg font-bold text-white tracking-tight'>Control Your Financial Future</h3>
            <p className='text-xs text-gray-400 leading-relaxed max-w-sm mx-auto font-medium'>
              Join users who use ExpenseTracker AI to automate tracking, optimize budgets, and grow their wealth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
