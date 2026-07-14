'use client';

import { useState } from 'react';
import { Record } from '@/types/Record';
import RecordItem from './RecordItem';
import getAllRecords from '@/app/actions/getAllRecords';

const CATEGORIES = [
  'All', 'Food', 'Transportation', 'Shopping',
  'Entertainment', 'Bills', 'Healthcare', 'Income', 'Other',
];

// ── CSV Export Helper ────────────────────────────────────────────────────────
function exportToCSV(records: Record[]) {
  const headers = ['Date', 'Type', 'Description', 'Category', 'Amount (₹)'];
  const rows = records.map((r) => [
    new Date(r.date).toLocaleDateString('en-IN'),
    r.type === 'income' ? 'Income' : 'Expense',
    `"${r.text.replace(/"/g, '""')}"`,
    r.category,
    r.amount.toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expense-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const RecordHistoryList = ({ records: initialRecords }: { records: Record[] }) => {
  const [records, setRecords] = useState<Record[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'expense' | 'income'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  // ── Load All Records ──────────────────────────────────────────────────────
  const handleLoadAll = async () => {
    setIsLoadingMore(true);
    const { records: all } = await getAllRecords();
    if (all) {
      setRecords(all);
      setAllLoaded(true);
    }
    setIsLoadingMore(false);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || record.category === selectedCategory;
    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'income' && record.type === 'income') ||
      (selectedType === 'expense' && record.type !== 'income');
    return matchesSearch && matchesCategory && matchesType;
  });

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest') return b.amount - a.amount;
    if (sortBy === 'lowest') return a.amount - b.amount;
    return 0;
  });

  return (
    <div className='space-y-4'>
      {/* Controls Row 1: Search + Type + Sort */}
      <div className='grid grid-cols-1 sm:grid-cols-12 gap-3'>
        {/* Search */}
        <div className='sm:col-span-5 relative'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search description...'
            className='w-full pl-8 pr-3 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 placeholder-gray-400 dark:placeholder-gray-500 shadow-inner transition-all duration-200'
          />
          <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none'>🔍</span>
        </div>

        {/* Category Filter */}
        <div className='sm:col-span-4 relative'>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='w-full px-2.5 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 cursor-pointer shadow-inner transition-all duration-200'
          >
            {CATEGORIES.map((cat, idx) => (
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
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className='w-full px-2.5 py-2.5 bg-gray-50/50 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-theme-cyan/25 focus:border-theme-cyan text-gray-900 dark:text-gray-150 cursor-pointer shadow-inner transition-all duration-200'
          >
            <option value='newest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>📅 Newest</option>
            <option value='oldest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>📅 Oldest</option>
            <option value='highest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>💰 Highest</option>
            <option value='lowest' className='text-gray-900 dark:text-gray-100 bg-white dark:bg-theme-dark'>💰 Lowest</option>
          </select>
        </div>
      </div>

      {/* Controls Row 2: Type Filter + CSV Export */}
      <div className='flex items-center justify-between pb-3 border-b border-gray-150/40 dark:border-white/5'>
        {/* Income / Expense filter pills */}
        <div className='flex gap-1.5'>
          {(['All', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 border ${
                selectedType === t
                  ? t === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                    : t === 'expense'
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30'
                    : 'bg-theme-cyan/10 dark:bg-theme-cyan/20 text-theme-cyan dark:text-cyan-300 border-theme-cyan/20'
                  : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200/50 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {t === 'All' ? '📁 All' : t === 'income' ? '💰 Income' : '💸 Expense'}
            </button>
          ))}
        </div>

        {/* CSV Export */}
        <button
          onClick={() => exportToCSV(sortedRecords)}
          disabled={sortedRecords.length === 0}
          title='Export filtered transactions to CSV'
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-cyan/10 dark:bg-theme-cyan/20 text-theme-cyan dark:text-cyan-300 text-[10px] font-bold border border-theme-cyan/20 hover:bg-theme-cyan/20 dark:hover:bg-theme-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200'
        >
          <span>⬇️</span> Export CSV
        </button>
      </div>

      {/* Result count */}
      <div className='flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 font-semibold'>
        <span>
          Showing {sortedRecords.length} of {records.length} records
          {!allLoaded && records.length === 10 && ' (showing latest 10)'}
        </span>
        {!allLoaded && (
          <button
            onClick={handleLoadAll}
            disabled={isLoadingMore}
            className='flex items-center gap-1 text-theme-cyan dark:text-cyan-400 hover:underline disabled:opacity-50 transition-all duration-150'
          >
            {isLoadingMore ? (
              <>
                <div className='w-2.5 h-2.5 border border-theme-cyan/30 border-t-theme-cyan rounded-full animate-spin'></div>
                Loading...
              </>
            ) : (
              'Load all records →'
            )}
          </button>
        )}
      </div>

      {/* Grid of transaction items */}
      {sortedRecords.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-1.5 pt-1.5'>
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
