'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const { user, loading, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className='sticky top-0 z-50 bg-white/80 dark:bg-theme-deep/80 backdrop-blur-xl border-b border-gray-250/20 dark:border-white/5 shadow-md shadow-gray-900/5 dark:shadow-black/20 transition-all duration-305'>
      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-14'>
        <div className='flex items-center justify-between h-20 sm:h-22 animate-fade-in'>
          {/* Logo Section */}
          <div className='flex items-center'>
            <Link
              href='/'
              className='flex items-center gap-3 sm:gap-3.5 flex-shrink-0 group transition-all duration-300'
              onClick={closeMobileMenu}
            >
              <img src="/icon.png" alt="Expense Logo" width={36} height={36} className="h-9 sm:h-10 w-9 sm:w-10 object-contain filter brightness-100 dark:brightness-110 group-hover:scale-105 transition-transform duration-300 rounded-xl" />
              <span className='font-sora font-extrabold text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-gray-100 tracking-tight transition-colors duration-300 group-hover:text-theme-cyan select-none'>
                Expense <span className='text-[#5BC0BE]'>AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links with Active Page checking */}
          <div className='hidden md:flex items-center space-x-2 lg:space-x-4'>
            <Link
              href='/'
              className={`relative hover:text-theme-cyan dark:hover:text-cyan-305 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                pathname === '/' ? 'text-theme-cyan dark:text-cyan-300' : 'text-gray-600 dark:text-gray-305'
              }`}
            >
              <span className='relative z-10'>Home</span>
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-theme-cyan transition-all duration-300 ease-out rounded-full ${
                pathname === '/' ? 'w-3/4' : 'w-0 group-hover:w-3/4'
              }`}></span>
            </Link>

            <Link
              href='/about'
              className={`relative hover:text-theme-cyan dark:hover:text-cyan-305 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                pathname === '/about' ? 'text-theme-cyan dark:text-cyan-300' : 'text-gray-600 dark:text-gray-305'
              }`}
            >
              <span className='relative z-10'>About</span>
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-theme-cyan transition-all duration-300 ease-out rounded-full ${
                pathname === '/about' ? 'w-3/4' : 'w-0 group-hover:w-3/4'
              }`}></span>
            </Link>

            <Link
              href='/contact'
              className={`relative hover:text-theme-cyan dark:hover:text-cyan-305 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                pathname === '/contact' ? 'text-theme-cyan dark:text-cyan-300' : 'text-gray-600 dark:text-gray-305'
              }`}
            >
              <span className='relative z-10'>Contact</span>
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-theme-cyan transition-all duration-300 ease-out rounded-full ${
                pathname === '/contact' ? 'w-3/4' : 'w-0 group-hover:w-3/4'
              }`}></span>
            </Link>
          </div>

          {/* Right Section */}
          <div className='flex items-center space-x-2 sm:space-x-3'>
            {/* Theme Toggle */}
            <div className='p-1'>
              <ThemeToggle />
            </div>

            {/* Authentication - Desktop */}
            <div className='hidden sm:flex items-center gap-3'>
              {loading ? (
                <div className='w-8 h-8 rounded-full border-2 border-theme-cyan/30 border-t-theme-cyan animate-spin'></div>
              ) : user ? (
                /* Authenticated User Menu */
                <div className='relative' ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className='flex items-center gap-2 p-1.5 rounded-xl bg-gray-50 dark:bg-theme-dark border border-gray-250/30 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-theme-muted/20 hover:border-theme-cyan/30 active:scale-[0.98] transition-all duration-200 shadow-sm'
                  >
                    <img
                      src={user.imageUrl || '/default-avatar.png'}
                      alt={user.name || 'User'}
                      className='w-8 h-8 rounded-lg object-cover shadow-sm'
                    />
                    <span className='text-xs font-bold text-gray-700 dark:text-gray-300 pr-1 max-w-[100px] truncate hidden md:inline'>
                      {user.name}
                    </span>
                  </button>
                  
                  {/* Premium Dropdown list */}
                  {isDropdownOpen && (
                    <div className='absolute right-0 mt-2.5 w-52 bg-white/95 dark:bg-theme-dark/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-2xl shadow-xl py-2.5 z-50 animate-float-short'>
                      <div className='px-4 py-2 border-b border-gray-100 dark:border-white/5 mb-2'>
                        <p className='text-xs font-bold text-gray-900 dark:text-gray-100 truncate'>{user.name}</p>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate'>{user.email}</p>
                      </div>
                      <Link
                        href='/'
                        onClick={() => setIsDropdownOpen(false)}
                        className='flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-305 hover:bg-theme-cyan/10 hover:text-theme-cyan transition-colors rounded-lg mx-1.5'
                      >
                        📊 Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className='w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors rounded-lg'
                      >
                        🚪 Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not authenticated buttons */
                <Link href='/sign-in'>
                  <button className='relative overflow-hidden bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(91,192,190,0.25)] hover:shadow-[0_4px_25px_rgba(91,192,190,0.45)] border border-theme-cyan/20 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center gap-1.5 group'>
                    <span>Sign In</span>
                    <span className='inline-block group-hover:translate-x-1 transition-transform duration-200 ml-0.5'>→</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className='md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-305 hover:text-theme-cyan dark:hover:text-cyan-400 hover:bg-theme-cyan/10 transition-all duration-200 active:scale-95'
              aria-label='Toggle mobile menu'
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                ) : (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className='px-3 pt-2 pb-4 space-y-1.5 bg-white/95 dark:bg-theme-dark/95 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 mt-2.5 shadow-xl'>
            <Link
              href='/'
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/' ? 'text-theme-cyan bg-theme-cyan/10' : 'text-gray-700 dark:text-gray-305 hover:text-theme-cyan hover:bg-theme-cyan/5'
              }`}
              onClick={closeMobileMenu}
            >
              <span className='text-base'>🏠</span>
              <span>Home</span>
            </Link>
            <Link
              href='/about'
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/about' ? 'text-theme-cyan bg-theme-cyan/10' : 'text-gray-700 dark:text-gray-305 hover:text-theme-cyan hover:bg-theme-cyan/5'
              }`}
              onClick={closeMobileMenu}
            >
              <span className='text-base'>ℹ️</span>
              <span>About</span>
            </Link>
            <Link
              href='/contact'
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/contact' ? 'text-theme-cyan bg-theme-cyan/10' : 'text-gray-700 dark:text-gray-305 hover:text-theme-cyan hover:bg-theme-cyan/5'
              }`}
              onClick={closeMobileMenu}
            >
              <span className='text-base'>📞</span>
              <span>Contact</span>
            </Link>

            {/* Mobile Authentication */}
            <div className='pt-3 border-t border-gray-250/20 dark:border-white/5'>
              {loading ? (
                <div className='flex justify-center py-2'>
                  <div className='w-6 h-6 rounded-full border-2 border-theme-cyan/30 border-t-theme-cyan animate-spin'></div>
                </div>
              ) : user ? (
                <div className='space-y-1'>
                  <div className='flex items-center gap-3 px-3.5 py-2.5'>
                    <img
                      src={user.imageUrl || '/default-avatar.png'}
                      alt={user.name || 'User'}
                      className='w-9 h-9 rounded-lg object-cover shadow-sm'
                    />
                    <div className='text-left min-w-0'>
                      <p className='text-xs font-bold text-gray-900 dark:text-gray-100 truncate'>{user.name}</p>
                      <p className='text-[10px] text-gray-505 dark:text-gray-400 truncate'>{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      logout();
                    }}
                    className='w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/10 text-sm font-bold transition-all duration-200'
                  >
                    🚪 Log Out
                  </button>
                </div>
              ) : (
                <Link href='/sign-in' onClick={closeMobileMenu}>
                  <button className='w-full bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-4 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(91,192,190,0.2)] hover:shadow-[0_4px_25px_rgba(91,192,190,0.4)] border border-theme-cyan/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer'>
                    <span>Sign In</span>
                    <span>→</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}