import React from 'react';
import getUserRecord from '@/app/actions/getUserRecord';
import getBestWorstExpense from '@/app/actions/getBestWorstExpense';

const ExpenseStats = async () => {
  try {
    // Fetch both average and range data
    const [userRecordResult, rangeResult] = await Promise.all([
      getUserRecord(),
      getBestWorstExpense(),
    ]);

    const { record, daysWithRecords } = userRecordResult;
    const { bestExpense, worstExpense } = rangeResult;

    // Calculate average expense
    const totalSpent = record || 0;
    const validDays = daysWithRecords && daysWithRecords > 0 ? daysWithRecords : 1;
    const averageExpense = totalSpent / validDays;

    // Budget Progress Configuration
    const monthlyBudget = 50000;
    const percentage = Math.min((totalSpent / monthlyBudget) * 100, 100);
    const isOverBudget = totalSpent > monthlyBudget;

    return (
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
        {/* Total Spent Card */}
        <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-red-500/5 dark:bg-red-500/2 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center justify-between mb-2 relative z-10'>
            <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
              Total Spent
            </span>
            <div className='w-7 h-7 bg-red-50 dark:bg-red-950/40 rounded-lg flex items-center justify-center text-sm shadow-sm'>
              💸
            </div>
          </div>
          <div className='relative z-10'>
            <div className={`text-xl sm:text-2xl font-black ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'} tracking-tight`}>
              ₹{totalSpent.toLocaleString('en-IN')}
            </div>
            
            {/* Progress bar */}
            <div className='mt-3.5 space-y-1'>
              <div className='w-full bg-gray-150 dark:bg-gray-850 h-1.5 rounded-full overflow-hidden' style={{ borderRadius: 'inherit' }}>
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-red-400'}`}
                  style={{ width: `${percentage}%`, borderRadius: 'inherit' }}
                ></div>
              </div>
              <div className='flex items-center justify-between text-[9px] font-semibold text-gray-400 dark:text-gray-500'>
                <span>Budget: ₹50K</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Average Card */}
        <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-theme-cyan/10 dark:bg-theme-cyan/5 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center justify-between mb-2 relative z-10'>
            <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
              Daily Average
            </span>
            <div className='w-7 h-7 bg-theme-cyan/10 dark:bg-theme-cyan/30 rounded-lg flex items-center justify-center text-sm shadow-sm'>
              📊
            </div>
          </div>
          <div className='relative z-10'>
            <div className='text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight'>
              ₹{averageExpense.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </div>
            <div className='mt-3 bg-theme-cyan/10 dark:bg-theme-cyan/25 text-theme-cyan dark:text-cyan-300 px-2 py-0.5 rounded-md text-[9px] font-bold w-fit border border-theme-purple/20 dark:border-white/5'>
              Over {validDays} Active {validDays === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Highest Expense Card */}
        <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/2 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center justify-between mb-2 relative z-10'>
            <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-505 tracking-wider'>
              Highest Expense
            </span>
            <div className='w-7 h-7 bg-amber-50 dark:bg-amber-955/30 rounded-lg flex items-center justify-center text-sm shadow-sm'>
              ▲
            </div>
          </div>
          <div className='relative z-10'>
            <div className='text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight'>
              {bestExpense !== undefined ? `₹${bestExpense.toLocaleString('en-IN')}` : '₹0'}
            </div>
            <p className='text-[9px] text-gray-400 dark:text-gray-505 font-medium mt-3.5'>
              Single peak transaction
            </p>
          </div>
        </div>

        {/* Lowest Expense Card */}
        <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-theme-muted/10 dark:bg-theme-muted/5 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
          <div className='flex items-center justify-between mb-2 relative z-10'>
            <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-505 tracking-wider'>
              Lowest Expense
            </span>
            <div className='w-7 h-7 bg-theme-muted/10 dark:bg-theme-muted/30 rounded-lg flex items-center justify-center text-sm shadow-sm'>
              ▼
            </div>
          </div>
          <div className='relative z-10'>
            <div className='text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight'>
              {worstExpense !== undefined ? `₹${worstExpense.toLocaleString('en-IN')}` : '₹0'}
            </div>
            <p className='text-[9px] text-gray-400 dark:text-gray-505 font-medium mt-3.5'>
              Single lowest transaction
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching expense statistics:', error);
    return (
      <div className='w-full bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-5 rounded-3xl border border-red-150 dark:border-red-950/30 text-center shadow-lg'>
        <span className='text-red-500 font-semibold text-sm'>Unable to load spending statistics.</span>
      </div>
    );
  }
};

export default ExpenseStats;