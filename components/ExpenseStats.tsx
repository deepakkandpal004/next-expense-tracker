'use client';

import React, { useEffect, useState } from 'react';
import getUserRecord from '@/app/actions/getUserRecord';
import getBestWorstExpense from '@/app/actions/getBestWorstExpense';

const DEFAULT_BUDGET = 50000;

const ExpenseStats = () => {
  const [stats, setStats] = useState<{
    totalExpenses: number;
    totalIncome: number;
    netBalance: number;
    daysWithRecords: number;
    bestExpense?: number;
    worstExpense?: number;
  } | null>(null);
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load budget from localStorage
    const stored = localStorage.getItem('monthly_budget');
    if (stored) setBudget(parseInt(stored, 10));

    // Fetch stats from server
    Promise.all([getUserRecord(), getBestWorstExpense()])
      .then(([recordResult, rangeResult]) => {
        const { totalExpenses = 0, totalIncome = 0, netBalance = 0, daysWithRecords = 0 } = recordResult;
        const { bestExpense, worstExpense } = rangeResult;
        setStats({ totalExpenses, totalIncome, netBalance, daysWithRecords, bestExpense, worstExpense });
      })
      .catch(() => setError('Unable to load spending statistics.'));
  }, []);

  const saveBudget = () => {
    const val = parseInt(budgetInput, 10);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem('monthly_budget', val.toString());
    }
    setIsEditingBudget(false);
  };

  if (error) {
    return (
      <div className='w-full bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-5 rounded-3xl border border-red-150 dark:border-red-950/30 text-center shadow-lg'>
        <span className='text-red-500 font-semibold text-sm'>{error}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 min-h-[120px] animate-pulse'>
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2'></div>
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
          </div>
        ))}
      </div>
    );
  }

  const { totalExpenses, totalIncome, netBalance, daysWithRecords, bestExpense, worstExpense } = stats;
  const validDays = daysWithRecords > 0 ? daysWithRecords : 1;
  const averageExpense = totalExpenses / validDays;
  const percentage = Math.min((totalExpenses / budget) * 100, 100);
  const isOverBudget = totalExpenses > budget;
  const isNetPositive = netBalance >= 0;

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
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          {/* Budget Progress */}
          <div className='mt-3.5 space-y-1'>
            <div className='w-full bg-gray-150 dark:bg-gray-850 h-1.5 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-red-400'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className='flex items-center justify-between text-[9px] font-semibold text-gray-400 dark:text-gray-500'>
              <button
                onClick={() => { setIsEditingBudget(true); setBudgetInput(budget.toString()); }}
                className='hover:text-theme-cyan transition-colors cursor-pointer flex items-center gap-0.5'
                title='Edit monthly budget'
              >
                Budget: ₹{(budget / 1000).toFixed(0)}K ✏️
              </button>
              <span>{percentage.toFixed(0)}%</span>
            </div>
          </div>
          {/* Budget edit modal */}
          {isEditingBudget && (
            <div className='absolute inset-x-0 bottom-0 top-0 bg-white/95 dark:bg-theme-dark/95 rounded-3xl flex flex-col items-center justify-center gap-2 z-20 p-3'>
              <span className='text-[10px] font-bold text-gray-600 dark:text-gray-300'>Set Monthly Budget</span>
              <input
                type='number'
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className='w-full text-center text-sm font-bold px-2 py-1.5 border border-theme-cyan/40 rounded-lg bg-white dark:bg-theme-deep focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 text-gray-900 dark:text-gray-100'
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
              />
              <div className='flex gap-1 w-full'>
                <button onClick={saveBudget} className='flex-1 py-1 rounded-lg bg-theme-cyan text-[#0b132b] text-[10px] font-black hover:bg-cyan-400 transition-colors'>Save</button>
                <button onClick={() => setIsEditingBudget(false)} className='flex-1 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total Income Card */}
      <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
        <div className='flex items-center justify-between mb-2 relative z-10'>
          <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
            Total Income
          </span>
          <div className='w-7 h-7 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex items-center justify-center text-sm shadow-sm'>
            💰
          </div>
        </div>
        <div className='relative z-10'>
          <div className='text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight'>
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <p className='text-[9px] text-gray-400 dark:text-gray-505 font-medium mt-3.5'>
            Total recorded earnings
          </p>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 ${isNetPositive ? 'bg-theme-cyan/10 dark:bg-theme-cyan/5' : 'bg-orange-500/10 dark:bg-orange-500/5'}`}></div>
        <div className='flex items-center justify-between mb-2 relative z-10'>
          <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
            Net Balance
          </span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm ${isNetPositive ? 'bg-theme-cyan/10 dark:bg-theme-cyan/30' : 'bg-orange-50 dark:bg-orange-950/40'}`}>
            {isNetPositive ? '📈' : '📉'}
          </div>
        </div>
        <div className='relative z-10'>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${isNetPositive ? 'text-theme-cyan dark:text-cyan-300' : 'text-orange-600 dark:text-orange-400'}`}>
            {isNetPositive ? '+' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN')}
          </div>
          <div className={`mt-3 px-2 py-0.5 rounded-md text-[9px] font-bold w-fit border ${isNetPositive ? 'bg-theme-cyan/10 dark:bg-theme-cyan/25 text-theme-cyan dark:text-cyan-300 border-theme-cyan/20' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/30'}`}>
            {isNetPositive ? '✓ Surplus' : '⚠ Deficit'}
          </div>
        </div>
      </div>

      {/* Daily Average Card */}
      <div className='bg-white/80 dark:bg-theme-dark/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg border border-gray-150/40 dark:border-white/5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:scale-[1.02]'>
        <div className='absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/2 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500'></div>
        <div className='flex items-center justify-between mb-2 relative z-10'>
          <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-505 tracking-wider'>
            Daily Avg Spend
          </span>
          <div className='w-7 h-7 bg-amber-50 dark:bg-amber-955/30 rounded-lg flex items-center justify-center text-sm shadow-sm'>
            📊
          </div>
        </div>
        <div className='relative z-10'>
          <div className='text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight'>
            ₹{averageExpense.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
          </div>
          <div className='mt-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-[9px] font-bold w-fit border border-amber-200/50 dark:border-amber-800/30'>
            Over {validDays} Active {validDays === 1 ? 'Day' : 'Days'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;