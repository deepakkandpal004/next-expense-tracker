'use client';

import { useState } from 'react';
import BarChart from './BarChart';
import CategoryPieChart from './CategoryPieChart';
import { Record } from '@/types/Record';

const RecordChartTabs = ({ records }: { records: Record[] }) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'categories'>('trend');

  const formattedRecords = records.map((record) => ({
    ...record,
    date: String(record.date),
  }));

  return (
    <div className='space-y-4'>
      {/* Tab Selectors */}
      <div className='flex items-center justify-between border-b border-gray-150/40 dark:border-gray-800/40 pb-3'>
        <div className='flex items-center gap-1 sm:gap-2 bg-gray-100/80 dark:bg-gray-900/60 p-1 rounded-xl w-fit'>
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <span>📈</span>
            <span>Spending Trend</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <span>🍕</span>
            <span>Category Share</span>
          </button>
        </div>

        <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block'>
          Live Analytics
        </span>
      </div>

      {/* Render Chart based on tab selection */}
      <div className='transition-all duration-300 ease-in-out'>
        {activeTab === 'trend' ? (
          <div className='overflow-x-auto'>
            <BarChart records={formattedRecords} />
          </div>
        ) : (
          <CategoryPieChart records={formattedRecords} />
        )}
      </div>
    </div>
  );
};

export default RecordChartTabs;
