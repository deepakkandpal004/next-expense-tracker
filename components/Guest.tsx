'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

interface FAQItemProps {
  question: string;
  answer: string;
  icon: string;
}

const FAQItem = ({ question, answer, icon }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='glass-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-150/40 dark:border-white/5'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer'
      >
        <div className='flex items-center gap-4'>
          <div className='w-9 h-9 bg-gradient-to-br from-theme-cyan/15 to-theme-dark/15 rounded-lg flex items-center justify-center shadow-inner flex-shrink-0'>
            <span className='text-sm sm:text-base'>{icon}</span>
          </div>
          <span className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100'>
            {question}
          </span>
        </div>
        <span className={`text-base text-gray-400 dark:text-gray-505 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 opacity-100 border-t border-gray-150/20 dark:border-white/5' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <p className='px-6 py-5 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/20 dark:bg-theme-dark/10'>
          {answer}
        </p>
      </div>
    </div>
  );
};

const Guest = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'categories' | 'dashboard'>('insights');

  return (
    <div className='font-sans bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] text-gray-800 dark:text-gray-200 transition-all duration-300 min-h-screen relative overflow-hidden'>
      {/* Subtly Layered Grid & Radial depth backdrops */}
      <div className='absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none'></div>
      <div className='glow-bg w-[450px] h-[450px] bg-theme-cyan/8 dark:bg-theme-cyan/4 top-[10%] left-[5%] animate-pulse-slow' style={{ filter: 'blur(110px)' }}></div>
      <div className='glow-bg w-[550px] h-[550px] bg-theme-muted/10 dark:bg-theme-muted/5 bottom-[-10%] right-[-10%] animate-pulse-slow' style={{ filter: 'blur(130px)', animationDelay: '-4s' }}></div>

      {/* Hero Section */}
      <section className='relative z-10 pt-28 lg:pt-32 pb-20 sm:pb-32 px-6 sm:px-12 lg:px-16'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-start'>
          
          {/* Hero Left Content */}
          <div className='lg:col-span-7 text-center lg:text-left space-y-8 animate-fade-in'>
            
            {/* Top Pill Badge */}
            <div className='inline-flex items-center gap-2.5 bg-theme-cyan/10 dark:bg-theme-cyan/15 text-theme-cyan dark:text-cyan-300 pl-4 pr-5 py-2 rounded-full text-xs font-bold tracking-wide border border-theme-cyan/25 dark:border-white/10 shadow-sm shadow-theme-cyan/5 hover:shadow-theme-cyan/15 transition-all duration-300 cursor-default mb-1.5'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-cyan opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-theme-cyan'></span>
              </span>
              <span>Next-Gen Smart Expense Management</span>
            </div>
            
            {/* Main Header */}
            <h1 className='text-4xl sm:text-5.5xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 leading-[1.05] tracking-tight max-w-[90%] lg:max-w-none animate-slide-up mb-5'>
              Master Your Money <br className='hidden lg:inline' /> with{' '}
              <span className='bg-gradient-to-r from-theme-cyan via-cyan-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(91,192,190,0.25)]'>
                Autonomous AI
              </span>
            </h1>
            
            {/* Description Paragraph */}
            <p className='text-base sm:text-lg lg:text-lg text-gray-655 dark:text-gray-300/90 leading-[1.7] max-w-lg mx-auto lg:mx-0 font-medium animate-slide-up [animation-delay:150ms] mb-8'>
              Stop guessing where your money goes. Track expenses instantly, categorize transactions automatically, and get actionable financial advice customized to your habits.
            </p>
            
            {/* Call To Actions */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-slide-up [animation-delay:200ms] mb-10'>
              <Link href='/sign-up' className='w-full sm:w-auto'>
                <button className='w-full sm:w-auto bg-theme-cyan hover:bg-[#4ea8a6] text-[#0b132b] px-8 py-4 rounded-xl font-bold shadow-[0_4px_20px_rgba(91,192,190,0.25)] hover:shadow-[0_4px_30px_rgba(91,192,190,0.45)] border border-theme-cyan/20 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group'>
                  Get Started Free
                  <span className='inline-block group-hover:translate-x-1 transition-transform duration-200 ml-1'>→</span>
                </button>
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className='w-full sm:w-auto border border-gray-250 dark:border-white/10 text-gray-805 dark:text-gray-300 hover:bg-theme-cyan/10 hover:border-theme-cyan/40 hover:text-theme-cyan px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm backdrop-blur-sm group cursor-pointer'
              >
                Learn More <span className='inline-block group-hover:translate-y-0.5 transition-transform duration-200 ml-0.5'>↓</span>
              </button>
            </div>
            
            {/* Social Trust Metrics */}
            <div className='pt-10 border-t border-gray-250/20 dark:border-white/5 flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-10 text-gray-500 dark:text-gray-400 animate-slide-up [animation-delay:300ms]'>
              <div className='group cursor-default text-left'>
                <span className='flex items-center gap-1.5 text-3xl font-black text-gray-900 dark:text-gray-100 group-hover:text-theme-cyan group-hover:scale-102 transition-all duration-300'>
                  <span className='text-sm'>✨</span>₹0
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-555 block mt-1'>Free Tier Forever</span>
              </div>
              <div className='bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent w-[1px] h-12 hidden sm:block'></div>
              <div className='group cursor-default text-left'>
                <span className='flex items-center gap-1.5 text-3xl font-black text-gray-900 dark:text-gray-100 group-hover:text-theme-cyan group-hover:scale-102 transition-all duration-300'>
                  <span className='text-sm'>🔒</span>100%
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-555 block mt-1'>Privacy Protected</span>
              </div>
              <div className='bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent w-[1px] h-12 hidden sm:block'></div>
              <div className='group cursor-default text-left'>
                <span className='flex items-center gap-1.5 text-3xl font-black text-gray-900 dark:text-gray-100 group-hover:text-theme-cyan group-hover:scale-102 transition-all duration-300'>
                  <span className='text-sm'>⚡</span>Instant
                </span>
                <span className='text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-555 block mt-1'>AI Suggestions</span>
              </div>
            </div>
          </div>
          
          {/* Hero Right Preview */}
          <div className='lg:col-span-5 relative z-10 w-full max-w-lg mx-auto animate-float animate-fade-in [animation-delay:200ms] lg:translate-y-8 lg:mt-6'>
            <div className='absolute inset-0 bg-gradient-to-tr from-theme-cyan/20 to-theme-dark/30 rounded-[32px] blur-3xl -z-10 transform scale-105 opacity-80 animate-glow-pulse'></div>
            
            <div className='glass-card rounded-2xl shadow-2xl p-8 border border-white/60 dark:border-white/10 relative overflow-hidden hover:shadow-theme-cyan/5 transition-shadow duration-300'>
              {/* Mock Header */}
              <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-150/40 dark:border-white/5'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-theme-cyan to-theme-muted flex items-center justify-center text-white shadow-md shadow-theme-cyan/25'>
                    💰
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-900 dark:text-gray-100 text-sm tracking-tight'>My Dashboard</h4>
                    <span className='text-[10px] text-theme-cyan dark:text-cyan-400 font-bold flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></span>
                      Live Financial AI Active
                    </span>
                  </div>
                </div>
                <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs shadow-inner'>
                  👤
                </div>
              </div>
              
              {/* Mock Cards Row */}
              <div className='grid grid-cols-2 gap-4 mb-6'>
                <div className='bg-gradient-to-br from-white to-gray-50 dark:from-theme-dark/60 dark:to-theme-deep/60 p-4 rounded-xl border border-gray-250/20 dark:border-white/5 shadow-sm hover:scale-[1.02] transition-transform duration-300'>
                  <span className='text-[10px] uppercase font-bold text-gray-400 dark:text-gray-505 tracking-wider block mb-1'>Monthly Budget</span>
                  <span className='text-lg font-extrabold text-gray-900 dark:text-gray-100'>₹50,000</span>
                  <div className='w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-2.5 overflow-hidden' style={{ borderRadius: 'inherit' }}>
                    <div className='bg-theme-cyan h-full w-[45%] animate-progress-fill' style={{ borderRadius: 'inherit' }}></div>
                  </div>
                </div>
                <div className='bg-gradient-to-br from-white to-gray-50 dark:from-theme-dark/60 dark:to-theme-deep/60 p-4 rounded-xl border border-gray-250/20 dark:border-white/5 shadow-sm hover:scale-[1.02] transition-transform duration-300'>
                  <span className='text-[10px] uppercase font-bold text-gray-400 dark:text-gray-505 tracking-wider block mb-1'>Total Spent</span>
                  <span className='text-lg font-extrabold text-red-500 dark:text-red-400'>₹22,450</span>
                  <span className='text-[9px] text-gray-500 dark:text-gray-400 block mt-2 font-medium'>₹27,550 Remaining</span>
                </div>
              </div>

              {/* Mock SVG Graph */}
              <div className='bg-white/80 dark:bg-theme-dark/80 rounded-2xl p-5 border border-gray-150/40 dark:border-white/5 mb-6 shadow-inner'>
                <div className='flex items-center justify-between mb-3.5'>
                  <span className='text-xs font-bold text-gray-900 dark:text-gray-100'>Weekly Trend</span>
                  <span className='text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-bold'>July</span>
                </div>
                <div className='h-24 flex items-end gap-3.5 justify-between pt-2'>
                  <div className='w-full bg-theme-cyan/10 rounded-lg h-[30%] flex flex-col justify-end transition-all duration-300 hover:scale-x-105 hover:bg-theme-cyan/20 animate-bar-grow'><div className='w-full bg-theme-cyan h-[60%] rounded-b-lg rounded-t-sm'></div></div>
                  <div className='w-full bg-theme-cyan/15 rounded-lg h-[60%] flex flex-col justify-end transition-all duration-300 hover:scale-x-105 hover:bg-theme-cyan/25 animate-bar-grow' style={{ animationDelay: '100ms' }}><div className='w-full bg-theme-cyan h-[70%] rounded-b-lg rounded-t-sm'></div></div>
                  <div className='w-full bg-theme-cyan/10 rounded-lg h-[45%] flex flex-col justify-end transition-all duration-300 hover:scale-x-105 hover:bg-theme-cyan/20 animate-bar-grow' style={{ animationDelay: '200ms' }}><div className='w-full bg-theme-cyan h-[50%] rounded-b-lg rounded-t-sm'></div></div>
                  <div className='w-full bg-red-500/10 rounded-lg h-[85%] flex flex-col justify-end transition-all duration-300 hover:scale-x-105 hover:bg-red-505/25 animate-bar-grow' style={{ animationDelay: '300ms' }}><div className='w-full bg-red-500 h-[85%] rounded-b-lg rounded-t-sm'></div></div>
                  <div className='w-full bg-theme-cyan/15 rounded-lg h-[40%] flex flex-col justify-end transition-all duration-300 hover:scale-x-105 hover:bg-theme-cyan/25 animate-bar-grow' style={{ animationDelay: '400ms' }}><div className='w-full bg-theme-cyan h-[65%] rounded-b-lg rounded-t-sm'></div></div>
                </div>
              </div>

              {/* Mock Recent AI Action */}
              <div className='bg-theme-cyan/10 dark:bg-theme-dark/30 rounded-xl p-3.5 border border-theme-cyan/15 dark:border-white/5 flex items-center justify-between shadow-sm'>
                <div className='flex items-center gap-2.5'>
                  <span className='text-base animate-bounce'>✨</span>
                  <div className='text-left'>
                    <p className='text-xs font-bold text-gray-800 dark:text-cyan-200'>Suggested Auto-Category</p>
                    <p className='text-[10px] text-gray-550 dark:text-gray-400'>&quot;Starbucks Coffee&quot; → Food & Dining (99% confidence)</p>
                  </div>
                </div>
                <span className='text-[9px] bg-theme-cyan/15 dark:bg-theme-cyan/25 text-theme-cyan dark:text-cyan-300 font-bold px-2 py-0.5 rounded-full'>98% Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section with Interactive Tab Previews */}
      <section id='features' className='py-24 px-6 sm:px-12 lg:px-16 border-t border-gray-150/40 dark:border-white/5 bg-white/60 dark:bg-theme-dark/40 relative z-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center max-w-3xl mx-auto mb-16'>
            <span className='text-theme-cyan dark:text-cyan-400 font-bold text-xs uppercase tracking-widest block mb-2.5'>Core Features</span>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Engineered for Smart Spending
            </h2>
            <p className='text-base sm:text-lg text-gray-655 dark:text-gray-400 mt-4 leading-relaxed'>
              Say goodbye to manual categorization and complex spreadsheets. Let AI do the heavy lifting.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className='flex justify-center flex-wrap gap-2.5 mb-12'>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-305 flex items-center gap-2 border shadow-sm cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-theme-dark border-theme-cyan/30 text-theme-cyan shadow-md shadow-theme-cyan/10'
                  : 'bg-gray-105 hover:bg-gray-200/60 dark:bg-[#1c2541]/40 dark:hover:bg-[#1c2541]/75 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>🤖</span>
              <span>AI Insights</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-305 flex items-center gap-2 border shadow-sm cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-theme-dark border-theme-cyan/30 text-theme-cyan shadow-md shadow-theme-cyan/10'
                  : 'bg-gray-105 hover:bg-gray-200/60 dark:bg-[#1c2541]/40 dark:hover:bg-[#1c2541]/75 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>✨</span>
              <span>Auto-Categorization</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-305 flex items-center gap-2 border shadow-sm cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-theme-dark border-theme-cyan/30 text-theme-cyan shadow-md shadow-theme-cyan/10'
                  : 'bg-gray-105 hover:bg-gray-200/60 dark:bg-[#1c2541]/40 dark:hover:bg-[#1c2541]/75 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>📊</span>
              <span>Interactive UI</span>
            </button>
          </div>

          {/* Feature Showcase Card */}
          <div className='glass-card rounded-2xl p-6 sm:p-10 border border-gray-150/40 dark:border-white/5 shadow-xl min-h-[300px] flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl transition-all duration-350'>
            <div className='flex-1 space-y-5 text-left'>
              {activeTab === 'insights' && (
                <>
                  <div className='w-12 h-12 rounded-xl bg-theme-cyan/15 flex items-center justify-center text-xl text-theme-cyan shadow-sm'>
                    🤖
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight'>Intelligent Personal Financial Assistant</h3>
                  <p className='text-gray-655 dark:text-gray-400 leading-relaxed text-sm sm:text-base'>
                    Our built-in financial models track and monitor your recent transactions. You get automatically generated summaries pointing out high-spending zones, utility alerts, and tailored advice to hit your monthly savings goals.
                  </p>
                  <ul className='space-y-2 text-sm text-gray-550 dark:text-gray-450 font-semibold'>
                    <li className='flex items-center gap-2.5'>✓ Instant detection of anomalies</li>
                    <li className='flex items-center gap-2.5'>✓ Weekly budget warnings</li>
                    <li className='flex items-center gap-2.5'>✓ Conversational custom financial queries</li>
                  </ul>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div className='w-12 h-12 rounded-xl bg-theme-cyan/15 flex items-center justify-center text-xl text-theme-cyan shadow-sm'>
                    ✨
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight'>Smart Auto-Categorization</h3>
                  <p className='text-gray-655 dark:text-gray-400 leading-relaxed text-sm sm:text-base'>
                    Just write what you spent the money on (e.g., &quot;Dinner with friends at Nando&apos;s&quot;), and the AI automatically matches it to Food, Transportation, Entertainment, or Bills. No manual configuration needed.
                  </p>
                  <ul className='space-y-2 text-sm text-gray-550 dark:text-gray-455 font-semibold'>
                    <li className='flex items-center gap-2.5'>✓ Categorizes instantly on submit</li>
                    <li className='flex items-center gap-2.5'>✓ 95%+ classification accuracy</li>
                    <li className='flex items-center gap-2.5'>✓ Ability to modify suggested categories manually</li>
                  </ul>
                </>
              )}

              {activeTab === 'dashboard' && (
                <>
                  <div className='w-12 h-12 rounded-xl bg-theme-cyan/15 flex items-center justify-center text-xl text-theme-cyan shadow-sm'>
                    📊
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight'>Fluid, Premium Interactive UI</h3>
                  <p className='text-gray-655 dark:text-gray-400 leading-relaxed text-sm sm:text-base'>
                    Enjoy a dark-mode optimized, fully responsive interface featuring rich aesthetics. Monitor your spending trends with live charts, and search/sort your transactions instantly.
                  </p>
                  <ul className='space-y-2 text-sm text-gray-550 dark:text-gray-455 font-semibold'>
                    <li className='flex items-center gap-2.5'>✓ Responsive layout optimized for phones & tablets</li>
                    <li className='flex items-center gap-2.5'>✓ Toggle chart visual types instantly</li>
                    <li className='flex items-center gap-2.5'>✓ Ultra-smooth micro-interactions and filters</li>
                  </ul>
                </>
              )}
            </div>

            {/* Visual preview inside showcase */}
            <div className='w-full md:w-1/2 flex items-center justify-center bg-gray-50 dark:bg-theme-deep/40 border border-gray-200/50 dark:border-gray-900 rounded-2xl p-6 min-h-[220px] shadow-inner'>
              {activeTab === 'insights' && (
                <div className='space-y-3.5 w-full text-left'>
                  <div className='border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/15 p-3 rounded-r-xl border border-yellow-250/20 shadow-sm'>
                    <div className='flex items-center gap-2 font-bold text-xs text-yellow-800 dark:text-yellow-400 mb-1'>
                      <span>⚠️</span> High Subscriptions Spent
                    </div>
                    <p className='text-[11px] text-gray-600 dark:text-gray-400'>You spent 35% more on software licenses this month. Consider canceling unused accounts.</p>
                  </div>
                  <div className='border-l-4 border-l-theme-cyan bg-theme-cyan/10 dark:bg-theme-dark/15 p-3 rounded-r-xl border border-theme-cyan/20 shadow-sm'>
                    <div className='flex items-center gap-2 font-bold text-xs text-theme-cyan dark:text-cyan-400 mb-1'>
                      <span>💡</span> Dining Savings Opportunity
                    </div>
                    <p className='text-[11px] text-gray-600 dark:text-gray-400'>If you reduce eating out by ₹1,500 next week, you will reach your monthly savings target.</p>
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div className='space-y-3.5 w-full'>
                  <div className='flex items-center justify-between bg-white dark:bg-theme-dark p-3 rounded-xl border border-gray-150/40 dark:border-white/5 shadow-sm hover:scale-[1.01] transition-transform'>
                    <span className='text-xs text-gray-800 dark:text-gray-200 font-medium'>🍔 UberEats Dinner Delivery</span>
                    <span className='text-[10px] font-bold text-theme-cyan bg-theme-cyan/10 px-2.5 py-0.5 rounded-full'>Food</span>
                  </div>
                  <div className='flex items-center justify-between bg-white dark:bg-theme-dark p-3 rounded-xl border border-gray-150/40 dark:border-white/5 shadow-sm hover:scale-[1.01] transition-transform'>
                    <span className='text-xs text-gray-800 dark:text-gray-200 font-medium'>🚗 Fuel Station Payment</span>
                    <span className='text-[10px] font-bold text-theme-muted bg-theme-muted/10 px-2.5 py-0.5 rounded-full'>Transportation</span>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className='w-full space-y-3 text-left'>
                  <div className='h-3 w-3/4 bg-gray-200 dark:bg-gray-855 rounded-full animate-pulse'></div>
                  <div className='h-9 bg-gradient-to-r from-theme-cyan/10 to-theme-dark/10 dark:from-theme-cyan/5 dark:to-theme-muted/5 border border-theme-cyan/20 rounded-xl flex items-center justify-between px-3'>
                    <span className='text-[10px] text-gray-500 dark:text-gray-455 font-bold uppercase tracking-wider'>Budget Alert Active</span>
                    <div className='w-2.5 h-2.5 rounded-full bg-theme-cyan animate-ping'></div>
                  </div>
                  <div className='flex gap-2 pt-1.5'>
                    <div className='h-8 w-24 bg-gray-200 dark:bg-gray-855 rounded-lg'></div>
                    <div className='h-8 w-24 bg-gray-200 dark:bg-gray-855 rounded-lg'></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-24 px-6 sm:px-12 lg:px-16 border-t border-gray-150/40 dark:border-white/5 bg-gray-50/50 dark:bg-theme-deep/20 relative z-10'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-16'>
            <span className='text-theme-cyan dark:text-cyan-400 font-bold text-xs uppercase tracking-widest block mb-2.5'>Support</span>
            <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Frequently Asked Questions
            </h2>
            <p className='text-base text-gray-550 dark:text-gray-400 mt-4 leading-relaxed'>
              Find answers to the most common questions about how ExpenseTracker AI helps you control your budget.
            </p>
          </div>

          <div className='space-y-4.5'>
            <FAQItem
              icon='❓'
              question='What is ExpenseTracker AI?'
              answer='ExpenseTracker AI is an intelligent financial management tool that uses artificial intelligence to help you monitor your spending patterns, get smart category suggestions, and receive personalized insights to improve your financial health.'
            />
            <FAQItem
              icon='🤖'
              question='How does the AI auto-categorization work?'
              answer='When you input an expense description, our AI matches it against common spending categories (Food, Bills, Shopping, Healthcare, etc.). Clicking the sparkle icon automatically fills in the matching category, saving you time!'
            />
            <FAQItem
              icon='🔒'
              question='Is my financial data secure?'
              answer='Absolutely. We take your privacy and data security very seriously. All user credentials and ledger dashboard assets are securely stored via our robust custom auth system, and transaction records are locked to your private user account.'
            />
            <FAQItem
              icon='💎'
              question='Do I have to pay to use the AI services?'
              answer='Our standard AI categorization and default insights are completely free to use. Premium subscriptions will offer extra charts, custom budget projections, and multi-currency tracking.'
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-24 px-6 sm:px-12 lg:px-16 border-t border-gray-150/40 dark:border-white/5 bg-white/60 dark:bg-theme-dark/40 relative z-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <span className='text-theme-cyan dark:text-cyan-400 font-bold text-xs uppercase tracking-widest block mb-2.5'>Testimonials</span>
            <h2 className='text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight'>
              Loved by Budget-Conscious Savers
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                name: 'Sarah L.',
                title: 'Product Manager',
                initial: 'S',
                quote: 'ExpenseTracker AI has completely transformed my budgeting. The AI insights are incredibly helpful and I now have full control over my finances!',
              },
              {
                name: 'John D.',
                title: 'Software Engineer',
                initial: 'J',
                quote: 'The AI-powered insights from ExpenseTracker have helped me identify and reduce unnecessary spending. The smart categorization is amazing!',
              },
              {
                name: 'Emily R.',
                title: 'Digital Creator',
                initial: 'E',
                quote: 'ExpenseTracker AI is so intelligent and easy to use. The AI recommendations are spot-on and have genuinely improved my financial habits!',
              },
            ].map((user, idx) => (
              <div key={idx} className='glass-card rounded-xl p-6.5 border border-gray-150/40 dark:border-white/5 shadow-md relative group hover:-translate-y-1 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center gap-3.5 mb-4.5'>
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-theme-cyan to-theme-muted text-white font-bold flex items-center justify-center shadow-md'>
                    {user.initial}
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-900 dark:text-gray-100 text-sm tracking-tight'>{user.name}</h4>
                    <span className='text-xs text-gray-400 dark:text-gray-550 font-semibold'>{user.title}</span>
                  </div>
                </div>
                <p className='text-sm text-gray-650 dark:text-gray-300 leading-relaxed italic'>
                  &ldquo;{user.quote}&rdquo;
                </p>
                <div className='text-theme-cyan text-xs mt-4'>
                  ★★★★★
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className='py-20 sm:py-28 px-6 sm:px-12 lg:px-16 border-t border-gray-150/40 dark:border-white/5 bg-gradient-to-b from-gray-50/50 to-theme-cyan/5 dark:from-[#0b132b] dark:to-theme-dark/30 relative z-10 text-center'>
        <div className='max-w-4xl mx-auto space-y-6 sm:space-y-8'>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight'>
            Take Control of Your Spending Today
          </h2>
          <p className='text-base sm:text-lg text-gray-650 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed'>
            Join thousands of savers who use ExpenseTracker AI to automate tracking, discover habits, and accumulate wealth.
          </p>
          <div className='pt-4'>
            <Link href='/sign-up' className='w-full sm:w-auto'>
              <button className='w-full sm:w-auto bg-theme-cyan hover:bg-[#4ea8a6] text-[#0b132b] px-10 py-4.5 rounded-xl font-bold shadow-[0_4px_20px_rgba(91,192,190,0.25)] hover:shadow-[0_4px_30px_rgba(91,192,190,0.45)] border border-theme-cyan/20 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 active:scale-[0.98] text-base cursor-pointer flex items-center justify-center gap-2 group mx-auto'>
                Register Your Account
                <span className='inline-block group-hover:translate-x-1 transition-transform duration-200 ml-1'>→</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Guest;