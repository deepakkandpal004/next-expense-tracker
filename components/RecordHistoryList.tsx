'use client';

import { useState } from 'react';
import { Record } from '@/types/Record';
import RecordItem from './RecordItem';

const RecordHistoryList = ({ records }: { records: Record[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // 1. Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 2. Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'highest') {
      return b.amount - a.amount;
    }
    if (sortBy === 'lowest') {
      return a.amount - b.amount;
    }
    return 0;
  });

  const categories = [
    'All',
    'Food',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills',
    'Healthcare',
    'Other',
  ];

  return (
    <div className='space-y-4'>
      {/* Search, Filter, and Sort Controls Row */}
      <div className='grid grid-cols-1 sm:grid-cols-12 gap-3 pb-4 border-b border-gray-150/40 dark:border-white/5'>
        {/* Search */}
        <div className='sm:col-span-5 relative'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search description...'
            className='w-full pl-8 pr-3 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner transition-all duration-200'
          />
          <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none'>
            🔍
          </span>
        </div>

        {/* Category Filter */}
        <div className='sm:col-span-4 relative'>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='w-full px-2.5 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 cursor-pointer shadow-inner transition-all duration-200'
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat} className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>
                {cat === 'All' ? '📁 All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div className='sm:col-span-3 relative'>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className='w-full px-2.5 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 cursor-pointer shadow-inner transition-all duration-200'
          >
            <option value='newest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>📅 Newest</option>
            <option value='oldest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>📅 Oldest</option>
            <option value='highest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>💰 Highest</option>
            <option value='lowest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>💰 Lowest</option>
          </select>
        </div>
      </div>

      {/* Grid of transaction items */}
      {sortedRecords.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-1.5 pt-1.5'>
          {sortedRecords.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className='text-center py-10 bg-gray-50/30 dark:bg-theme-deep/20 rounded-2xl border border-dashed border-gray-200 dark:border-white/5'>
          <span className='text-base block mb-2'>🔍</span>
          <span className='text-xs font-bold text-gray-500 dark:text-gray-400'>
            No matching transaction records found.
          </span>
        </div>
      )}
    </div>
  );
};

export default RecordHistoryList;
