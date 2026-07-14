import Link from 'next/link';
import Footer from '@/components/Footer';

const AboutPage = () => {
  return (
    <div className='font-sans bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] text-gray-800 dark:text-gray-200 transition-all duration-300 min-h-screen relative overflow-hidden'>
      {/* Grid Pattern */}
      <div className='absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none'></div>

      {/* Hero Section */}
      <section className='relative overflow-hidden flex flex-col items-center justify-center text-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-theme-cyan/5 via-theme-dark/10 to-[#3a506b]/5 dark:from-theme-cyan/5 dark:via-theme-dark/40 dark:to-[#1c2541]/40 border-b border-gray-150/40 dark:border-white/5'>
        <div className='absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none'></div>
        <div className='relative z-10 max-w-4xl mx-auto w-full'>
          <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 pl-4 pr-5 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-theme-cyan/20 dark:border-white/5 shadow-lg shadow-theme-cyan/5'>
            <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-theme-cyan rounded-full animate-pulse'></span>
            <span>Powered by AI Technology</span>
          </div>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 leading-tight tracking-tight'>
            About{' '}
            <span className='bg-gradient-to-r from-theme-cyan via-cyan-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(91,192,190,0.2)]'>
              Expense AI
            </span>
          </h1>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 font-medium'>
            Your intelligent companion for tracking expenses and managing your
            finances with cutting-edge AI-powered insights.
          </p>
          <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0'>
            <Link
              href='/sign-up'
              className='group relative overflow-hidden bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 border border-theme-cyan/20 cursor-pointer flex items-center justify-center gap-2'
            >
              <span className='relative z-10'>Start Your Journey</span>
              <span className='inline-block group-hover:translate-x-1 transition-transform duration-200'>→</span>
            </Link>
            <Link
              href='/contact'
              className='group bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-gray-250 dark:border-white/10 hover:border-theme-cyan/40 dark:hover:border-theme-cyan/30 text-gray-855 dark:text-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm cursor-pointer flex items-center justify-center'
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white/60 dark:bg-theme-dark/40 backdrop-blur-sm relative overflow-hidden border-b border-gray-150/40 dark:border-white/5'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-theme-cyan/20'>
            <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
            Our Mission
          </div>
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 text-gray-900 dark:text-gray-100 px-2 sm:px-0 tracking-tight'>
            Transforming Financial Management with{' '}
            <span className='text-theme-cyan dark:text-cyan-400 font-bold'>AI</span>
          </h2>
          <p className='text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto font-medium'>
            At Expense AI, we leverage cutting-edge artificial
            intelligence to revolutionize how individuals achieve financial
            wellness. Our AI analyzes your spending patterns to deliver
            personalized recommendations and actionable insights that lead to
            better budgeting and financial freedom.
          </p>
          <div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gradient-to-br from-theme-cyan/5 to-[#1c2541]/5 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 p-6 rounded-xl border border-theme-cyan/20 dark:border-[#1c2541]/60 shadow-sm'>
              <div className='text-3xl font-extrabold text-theme-cyan mb-2'>
                10K+
              </div>
              <div className='text-gray-650 dark:text-gray-400 font-bold text-xs uppercase tracking-wider'>
                Active Users
              </div>
            </div>
            <div className='bg-gradient-to-br from-theme-cyan/5 to-[#1c2541]/5 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 p-6 rounded-xl border border-theme-cyan/20 dark:border-[#1c2541]/60 shadow-sm'>
              <div className='text-3xl font-extrabold text-theme-cyan mb-2'>
                $2M+
              </div>
              <div className='text-gray-655 dark:text-gray-400 font-bold text-xs uppercase tracking-wider'>
                Money Tracked
              </div>
            </div>
            <div className='bg-gradient-to-br from-theme-cyan/5 to-[#1c2541]/5 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 p-6 rounded-xl border border-theme-cyan/20 dark:border-[#1c2541]/60 shadow-sm'>
              <div className='text-3xl font-extrabold text-theme-cyan mb-2'>
                99%
              </div>
              <div className='text-gray-655 dark:text-gray-400 font-bold text-xs uppercase tracking-wider'>
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-8 bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] relative border-b border-gray-150/40 dark:border-white/5'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3.5 py-1.5 rounded-full text-sm font-bold mb-6 border border-theme-cyan/20'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Features
            </div>
            <h2 className='text-4xl md:text-5xl font-black mb-6 text-gray-900 dark:text-gray-100 tracking-tight'>
              Why Choose{' '}
              <span className='text-theme-cyan dark:text-cyan-400'>
                Expense AI?
              </span>
            </h2>
            <p className='text-lg text-gray-655 dark:text-gray-400 max-w-2xl mx-auto font-medium'>
              Discover the powerful features that make our AI-driven platform
              the smart choice for modern financial management.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-12 h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-6'>
                  <span className='text-white text-xl'>🤖</span>
                </div>
                <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  AI-Powered Insights
                </h3>
                <p className='text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium'>
                  Get intelligent analysis of your spending patterns with
                  personalized AI recommendations and automated category
                  suggestions that learn from your behavior.
                </p>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-12 h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-6'>
                  <span className='text-white text-xl'>✨</span>
                </div>
                <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  Smart Categorization
                </h3>
                <p className='text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium'>
                  Let our AI automatically categorize your expenses with 99%
                  accuracy and provide tailored recommendations to enhance your
                  budget management effortlessly.
                </p>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-12 h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-6'>
                  <span className='text-white text-xl'>📊</span>
                </div>
                <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  Intelligent Dashboard
                </h3>
                <p className='text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium'>
                  Experience a modern, AI-enhanced interface with real-time
                  insights, interactive financial analytics, and beautiful
                  visualizations that make sense of your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className='py-20 px-8 bg-white/60 dark:bg-theme-dark/40 backdrop-blur-sm relative overflow-hidden border-b border-gray-150/40 dark:border-white/5'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-theme-cyan/5 dark:bg-theme-cyan/5 rounded-full blur-2xl'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-[#3a506b]/5 dark:bg-[#3a506b]/5 rounded-full blur-2xl'></div>

        <div className='max-w-4xl mx-auto relative z-10'>
          <div className='text-center mb-12'>
            <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3.5 py-1.5 rounded-full text-sm font-bold mb-6 border border-theme-cyan/20'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Our Story
            </div>
            <h2 className='text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-gray-100 tracking-tight'>
              Built for the{' '}
              <span className='text-theme-cyan dark:text-cyan-400 font-bold'>
                Future
              </span>
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6'>
              <p className='text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium'>
                Expense AI was born from the vision of creating truly
                intelligent financial management tools. Our team of financial
                experts, data scientists, and technologists came together to
                solve a critical problem: making personal finance management
                smarter, more intuitive, and more effective.
              </p>
              <p className='text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium'>
                Since our launch, we&#39;ve helped thousands of users achieve
                better budgeting and improve their overall financial health
                through the power of artificial intelligence. Every feature is
                designed with user experience and financial wellness in mind.
              </p>
              <div className='flex items-center gap-4 pt-4'>
                <div className='flex -space-x-2'>
                  <div className='w-10 h-10 bg-gradient-to-br from-theme-cyan to-[#3a506b] rounded-full border-2 border-white dark:border-theme-deep shadow-md'></div>
                  <div className='w-10 h-10 bg-gradient-to-br from-cyan-400 to-[#1c2541] rounded-full border-2 border-white dark:border-theme-deep shadow-md'></div>
                  <div className='w-10 h-10 bg-gradient-to-br from-theme-cyan to-cyan-200 rounded-full border-2 border-white dark:border-theme-deep shadow-md'></div>
                </div>
                <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium'>
                  <div className='font-bold text-gray-800 dark:text-gray-200'>Trusted by 10,000+ users</div>
                  <div>Join our growing community</div>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-theme-cyan/5 to-[#1c2541]/5 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 p-8 rounded-xl border border-theme-cyan/25 dark:border-[#1c2541]/60 shadow-sm'>
              <div className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-2.5 h-2.5 bg-theme-cyan rounded-full'></div>
                  <div className='text-gray-900 dark:text-gray-200 font-bold text-sm'>
                    Founded in 2024
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-2.5 h-2.5 bg-theme-cyan rounded-full'></div>
                  <div className='text-gray-900 dark:text-gray-200 font-bold text-sm'>
                    AI-First Approach
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-2.5 h-2.5 bg-theme-cyan rounded-full'></div>
                  <div className='text-gray-900 dark:text-gray-200 font-bold text-sm'>
                    Global Impact
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-2.5 h-2.5 bg-theme-cyan rounded-full'></div>
                  <div className='text-gray-900 dark:text-gray-200 font-bold text-sm'>
                    User-Centric Design
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='py-20 sm:py-24 px-8 bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] relative overflow-hidden'>
        <div className='absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-4.5 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 border border-theme-cyan/20 shadow-lg shadow-theme-cyan/5'>
            <span className='w-2 h-2 bg-theme-cyan rounded-full animate-pulse'></span>
            Ready to Transform Your Finances?
          </div>

          <h2 className='text-4xl md:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-gray-100 tracking-tight'>
            Take Control of Your{' '}
            <span className='bg-gradient-to-r from-theme-cyan via-cyan-400 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(91,192,190,0.2)]'>
              Financial Future
            </span>
          </h2>

          <p className='text-base sm:text-lg md:text-xl mb-10 text-gray-655 dark:text-gray-405 max-w-2xl mx-auto leading-relaxed font-medium'>
            Join thousands of users who have already transformed their financial
            habits with Expense AI. Start your journey towards smarter
            budgeting today.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link
              href='/sign-up'
              className='w-full sm:w-auto bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-8 py-4 rounded-xl font-bold shadow-[0_4px_20px_rgba(91,192,190,0.25)] hover:shadow-[0_4px_30px_rgba(91,192,190,0.45)] border border-theme-cyan/20 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group'
            >
              Get Started Free
              <span className='inline-block group-hover:translate-x-1 transition-transform duration-200 ml-1'>→</span>
            </Link>

            <Link
              href='/contact'
              className='w-full sm:w-auto bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-gray-250 dark:border-white/10 hover:border-theme-cyan/40 dark:hover:border-theme-cyan/30 text-gray-855 dark:text-gray-300 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm cursor-pointer flex items-center justify-center'
            >
              Contact Us
            </Link>
          </div>

          <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='text-2xl font-black text-theme-cyan mb-2'>
                Free
              </div>
              <div className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold'>
                No credit card required
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-black text-[#5bc0be] mb-2'>
                24/7
              </div>
              <div className='text-gray-655 dark:text-gray-400 text-xs sm:text-sm font-semibold'>
                AI-powered support
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-black text-[#3a506b] dark:text-[#5bc0be] mb-2'>
                Instant
              </div>
              <div className='text-gray-655 dark:text-gray-400 text-xs sm:text-sm font-semibold'>
                Setup in minutes
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AboutPage;