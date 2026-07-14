'use client';

import Footer from '@/components/Footer';

const ContactPage = () => {
  return (
    <div className='font-sans bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] text-gray-800 dark:text-gray-200 transition-all duration-300 min-h-screen relative overflow-hidden'>
      {/* Grid Pattern */}
      <div className='absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none'></div>

      {/* Hero Section */}
      <section className='relative overflow-hidden flex flex-col items-center justify-center text-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-theme-cyan/5 via-theme-dark/10 to-[#3a506b]/5 dark:from-theme-cyan/5 dark:via-theme-dark/40 dark:to-[#1c2541]/40 border-b border-gray-150/40 dark:border-white/5'>
        <div className='absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none'></div>
        <div className='relative z-10 max-w-4xl mx-auto w-full'>
          <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-lg border border-theme-cyan/20'>
            <span className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-theme-cyan rounded-full animate-pulse'></span>
            Get in Touch
          </div>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 leading-tight tracking-tight'>
            Contact{' '}
            <span className='bg-gradient-to-r from-theme-cyan via-cyan-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(91,192,190,0.2)]'>
              Expense AI
            </span>
          </h1>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 font-medium'>
            Have questions about AI-powered expense tracking or need help?
            We&#39;re here to assist you with intelligent financial management.
          </p>
          <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0'>
            <a
              href='mailto:dkandpal757@gmail.com'
              className='group relative overflow-hidden bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 border border-theme-cyan/20 cursor-pointer flex items-center justify-center gap-2'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                Send us an Email
                <span className='text-lg'>✉️</span>
              </span>
            </a>
            <a
              href='tel:+919123495043'
              className='group bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-gray-250 dark:border-white/10 hover:border-theme-cyan/40 dark:hover:border-theme-cyan/30 text-gray-855 dark:text-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer'
            >
              Call Us
              <span className='text-lg'>📞</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white/60 dark:bg-theme-dark/40 backdrop-blur-sm relative overflow-hidden border-b border-gray-150/40 dark:border-white/5'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-10 sm:mb-12 md:mb-16'>
            <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-theme-cyan/20'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Contact Information
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 px-2 sm:px-0 tracking-tight'>
              Multiple Ways to{' '}
              <span className='text-theme-cyan dark:text-cyan-400'>
                Connect
              </span>
            </h2>
            <p className='text-sm sm:text-base md:text-lg text-gray-655 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0 font-medium'>
              Choose the most convenient way to reach out to our Expense AI
              support team.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 text-center'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-4 sm:mb-6 mx-auto'>
                  <span className='text-white text-lg sm:text-xl'>✉️</span>
                </div>
                <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  Email Support
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed font-medium'>
                  Get detailed assistance with your questions. We typically
                  respond within 24 hours.
                </p>
                <a
                  href='mailto:dkandpal757@gmail.com'
                  className='inline-flex items-center gap-2 text-theme-cyan dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-305 font-bold transition-colors duration-200 text-sm break-all sm:break-normal'
                >
                  <span>dkandpal757@gmail.com</span>
                  <span className='text-sm'>→</span>
                </a>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 text-center'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-4 sm:mb-6 mx-auto'>
                  <span className='text-white text-lg sm:text-xl'>📞</span>
                </div>
                <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  Phone Support
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed font-medium'>
                  Speak directly with our support team for immediate assistance
                  with urgent matters.
                </p>
                <a
                  href='tel:+919123495043'
                  className='inline-flex items-center gap-2 text-theme-cyan dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-305 font-bold transition-colors duration-200 text-sm'
                >
                  <span>+91 9123495043</span>
                  <span className='text-sm'>→</span>
                </a>
              </div>
            </div>

            <div className='group relative bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 text-center sm:col-span-2 lg:col-span-1'>
              <div className='absolute inset-0 bg-gradient-to-br from-theme-cyan/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>
              <div className='relative z-10'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15 mb-4 sm:mb-6 mx-auto'>
                  <span className='text-white text-lg sm:text-xl'>📍</span>
                </div>
                <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100 tracking-tight'>
                  Office Location
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed font-medium'>
                  Visit our headquarters for in-person consultations and
                  partnership discussions.
                </p>
                <div className='text-theme-cyan dark:text-cyan-400 font-bold text-sm'>
                  Haldwani
                  <br />
                  Uttarakhand, India
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Hours & FAQ Section */}
      <section className='py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42]'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-10 sm:mb-12 md:mb-16'>
            <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-theme-cyan/20'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Support Information
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 px-2 sm:px-0 tracking-tight'>
              We&#39;re Here to{' '}
              <span className='text-theme-cyan dark:text-cyan-400'>
                Help
              </span>
            </h2>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
            <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-150/40 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-lg flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
                  <span className='text-white text-xs sm:text-sm'>🕒</span>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight'>
                  Support Hours
                </h3>
              </div>
              <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                <div className='flex justify-between border-b border-gray-100 dark:border-white/5 pb-2'>
                  <span>Monday - Friday:</span>
                  <span className='font-bold text-gray-850 dark:text-gray-250'>9:00 AM - 6:00 PM PST</span>
                </div>
                <div className='flex justify-between border-b border-gray-100 dark:border-white/5 pb-2'>
                  <span>Saturday:</span>
                  <span className='font-bold text-gray-850 dark:text-gray-250'>10:00 AM - 4:00 PM PST</span>
                </div>
                <div className='flex justify-between pb-1'>
                  <span>Sunday:</span>
                  <span className='font-bold text-gray-850 dark:text-gray-250'>Closed</span>
                </div>
                <div className='mt-4 p-3 bg-theme-cyan/10 dark:bg-[#1c2541]/40 border border-theme-cyan/20 rounded-lg'>
                  <p className='text-xs text-theme-cyan dark:text-cyan-300 leading-relaxed font-semibold'>
                    <strong>Email support:</strong> Available 24/7 with responses within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-150/40 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-lg flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
                  <span className='text-white text-xs sm:text-sm'>❓</span>
                </div>
                <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight'>
                  Quick Help
                </h3>
              </div>
              <div className='space-y-3'>
                <div className='p-3 bg-gray-50 dark:bg-theme-deep/50 border border-gray-100 dark:border-white/5 rounded-lg hover:shadow-sm transition-shadow duration-200'>
                  <h4 className='font-bold text-gray-950 dark:text-gray-100 text-xs sm:text-sm mb-1'>
                    Technical Issues
                  </h4>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-medium leading-normal'>
                    App not working properly? Check our troubleshooting guide
                    first.
                  </p>
                </div>
                <div className='p-3 bg-gray-50 dark:bg-theme-deep/50 border border-gray-100 dark:border-white/5 rounded-lg hover:shadow-sm transition-shadow duration-200'>
                  <h4 className='font-bold text-gray-950 dark:text-gray-100 text-xs sm:text-sm mb-1'>
                    AI Features
                  </h4>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-medium leading-normal'>
                    Questions about AI insights? Our AI documentation has
                    answers.
                  </p>
                </div>
                <div className='p-3 bg-gray-50 dark:bg-theme-deep/50 border border-gray-100 dark:border-white/5 rounded-lg hover:shadow-sm transition-shadow duration-200'>
                  <h4 className='font-bold text-gray-950 dark:text-gray-100 text-xs sm:text-sm mb-1'>
                    Account & Billing
                  </h4>
                  <p className='text-xs text-gray-600 dark:text-gray-400 font-medium leading-normal'>
                    Account issues or billing questions? Contact us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;