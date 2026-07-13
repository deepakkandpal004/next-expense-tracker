import AddNewRecord from '@/components/AddNewRecord';
import AIInsights from '@/components/AIInsights';
import ExpenseStats from '@/components/ExpenseStats';
import Guest from '@/components/Guest';
import RecordChart from '@/components/RecordChart';
import RecordHistory from '@/components/RecordHistory';
import { getAuthUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getAuthUser();
  if (!user) {
    return <Guest />;
  }

  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  return (
    <main className='bg-gradient-to-br from-gray-50 via-white to-theme-cyan/5 dark:from-[#0b132b] dark:via-[#0c1633] dark:to-[#121e42] text-gray-800 dark:text-gray-200 min-h-screen relative pb-16 overflow-hidden'>
      {/* Subtly Layered Grid */}
      <div className='absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none'></div>
      <div className='glow-bg w-[500px] h-[500px] bg-theme-cyan/8 dark:bg-theme-cyan/4 top-[5%] right-[5%] animate-pulse-slow' style={{ filter: 'blur(110px)' }}></div>
      <div className='glow-bg w-[400px] h-[400px] bg-theme-muted/10 dark:bg-theme-muted/5 bottom-[10%] left-[5%] animate-pulse-slow' style={{ filter: 'blur(110px)', animationDelay: '-3s' }}></div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 space-y-6 sm:space-y-8'>
        {/* Welcome Section & KPI Row Stack */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch'>
          {/* Welcome Card - taking 1 col on XL */}
          <div className='xl:col-span-1 glass-card p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl flex flex-row items-center gap-5 transition-all duration-300 relative overflow-hidden'>
            {/* User Image */}
            <div className='relative flex-shrink-0'>
              <img
                src={user.imageUrl || '/default-avatar.png'}
                alt={`${firstName}&#39;s profile`}
                className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white dark:border-gray-700 shadow-md'
              />
              <div className='absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-theme-cyan to-theme-muted rounded-full border-2 border-white dark:border-theme-deep flex items-center justify-center'>
                <span className='text-white text-xs font-bold'>✓</span>
              </div>
            </div>

            {/* Welcome Details */}
            <div className='flex-1 min-w-0'>
              <h2 className='text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 truncate leading-tight'>
                Hi, {firstName}!
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] sm:max-w-none truncate'>
                Welcome back to your financial control center.
              </p>
              
              <div className='flex items-center gap-1.5 mt-3.5 bg-theme-cyan/10 dark:bg-theme-cyan/15 dark:bg-theme-cyan/20 text-theme-cyan dark:text-cyan-300 px-2.5 py-1 rounded-lg text-[10px] font-bold w-fit border border-theme-cyan/20 dark:border-theme-cyan/20'>
                <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></span>
                <span>Active Session</span>
              </div>
            </div>
          </div>

          {/* Top-level KPI stats Row - taking 2 cols on XL */}
          <div className='xl:col-span-2'>
            <ExpenseStats />
          </div>
        </div>

        {/* Dashboard Grid - Two Columns */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start'>
          {/* Left Column - Input and Transaction list (takes 5/12 width) */}
          <div className='lg:col-span-5 space-y-6 sm:space-y-8'>
            <AddNewRecord />
            <RecordHistory />
          </div>

          {/* Right Column - Data Visualization and AI Assistant (takes 7/12 width) */}
          <div className='lg:col-span-7 space-y-6 sm:space-y-8'>
            <RecordChart />
            <AIInsights />
          </div>
        </div>
      </div>
    </main>
  );
}