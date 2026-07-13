import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42]'>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 animate-fade-in'>
          {/* Logo and Tagline */}
          <div className='text-center md:text-left'>
            <div className='inline-flex items-center gap-2.5 mb-4'>
              <img src="/expense.png" alt="Expense Logo" className="h-8 w-auto object-contain filter brightness-100 dark:brightness-110 rounded-lg" />
              <span className='font-extrabold text-base sm:text-lg text-gray-900 dark:text-gray-100 tracking-tight select-none'>
                Expense <span className='text-[#5BC0BE]'>AI</span>
              </span>
            </div>
            <p className='text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm font-medium text-sm sm:text-base'>
              Intelligent financial management powered by AI. Track your
              expenses, manage your budget, and gain insights into your spending
              patterns.
            </p>
          </div>

          {/* Navigation Links */}
          <div className='text-center md:text-left'>
            <h3 className='text-base font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider text-xs'>
              Quick Links
            </h3>
            <div className='flex flex-col space-y-3'>
              <Link
                href='/'
                className='group inline-flex items-center gap-2 text-gray-700 dark:text-gray-350 hover:text-theme-cyan dark:hover:text-theme-cyan text-sm font-semibold transition-colors duration-200'
              >
                <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                Home
              </Link>
              <Link
                href='/about'
                className='group inline-flex items-center gap-2 text-gray-700 dark:text-gray-350 hover:text-theme-cyan dark:hover:text-theme-cyan text-sm font-semibold transition-colors duration-200'
              >
                <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                About
              </Link>
              <Link
                href='/contact'
                className='group inline-flex items-center gap-2 text-gray-700 dark:text-gray-350 hover:text-theme-cyan dark:hover:text-theme-cyan text-sm font-semibold transition-colors duration-200'
              >
                <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200'></span>
                Contact
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className='text-center md:text-left'>
            <h3 className='text-base font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider text-xs'>
              Features
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3 text-gray-655 dark:text-gray-350 text-sm font-semibold'>
                <div className='w-5 h-5 bg-gradient-to-br from-theme-cyan to-[#3a506b] rounded-md flex items-center justify-center shadow-sm shadow-theme-cyan/15'>
                  <span className='text-white text-xs'>🤖</span>
                </div>
                AI-Powered Insights
              </div>
              <div className='flex items-center gap-3 text-gray-655 dark:text-gray-350 text-sm font-semibold'>
                <div className='w-5 h-5 bg-gradient-to-br from-[#3a506b] to-theme-cyan rounded-md flex items-center justify-center shadow-sm shadow-theme-cyan/15'>
                  <span className='text-white text-xs'>✨</span>
                </div>
                Smart Categorization
              </div>
              <div className='flex items-center gap-3 text-gray-655 dark:text-gray-350 text-sm font-semibold'>
                <div className='w-5 h-5 bg-gradient-to-br from-theme-cyan to-theme-muted rounded-md flex items-center justify-center shadow-sm shadow-theme-cyan/15'>
                  <span className='text-white text-xs'>📊</span>
                </div>
                Analytics Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/5 to-transparent mb-8'></div>

        {/* Copyright and Social */}
        <div className='flex flex-col md:flex-row justify-between items-center animate-fade-in'>
          <div className='text-center md:text-left mb-4 md:mb-0'>
            <p className='text-gray-500 dark:text-gray-450 text-sm font-medium'>
              © {new Date().getFullYear()} ExpenseTracker AI. All rights
              reserved.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <div className='inline-flex items-center gap-2 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-3 py-1.5 rounded-full text-xs font-bold border border-theme-cyan/20'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></span>
              Made by RS DEEPAK G
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;