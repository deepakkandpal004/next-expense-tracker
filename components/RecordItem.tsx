'use client';
import { useState } from 'react';
import { Record } from '@/types/Record';
import deleteRecord from '@/app/actions/deleteRecord';

// Helper function to get category emoji
const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'Food':
      return '🍔';
    case 'Transportation':
      return '🚗';
    case 'Shopping':
      return '🛒';
    case 'Entertainment':
      return '🎬';
    case 'Bills':
      return '💡';
    case 'Healthcare':
      return '🏥';
    default:
      return '📦';
  }
};

const RecordItem = ({ record }: { record: Record }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteRecord = async (recordId: string) => {
    setIsLoading(true); // Show loading spinner
    await deleteRecord(recordId); // Perform delete operation
    setIsLoading(false); // Hide loading spinner
  };

  // Determine border color based on expense amount
  const getBorderColor = (amount: number) => {
    if (amount > 3000) return 'border-red-500'; // High expense
    if (amount > 1000) return 'border-yellow-500'; // Medium expense
    return 'border-theme-cyan'; // Low expense (cyan/teal instead of green)
  };

  return (
    <li
      className={`bg-white/60 dark:bg-[#1c2541]/40 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-white/5 border-l-4 ${getBorderColor(
        record?.amount
      )} hover:bg-white/80 dark:hover:bg-[#1c2541]/80 relative min-h-[120px] sm:min-h-[140px] flex flex-col justify-between overflow-visible group transition-all duration-200`}
    >
      {/* Delete button positioned absolutely in top-right corner */}
      <button
        onClick={() => handleDeleteRecord(record.id)}
        className={`absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-650 hover:from-red-650 hover:to-red-700 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-white dark:border-theme-deep backdrop-blur-sm transform hover:scale-110 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer ${
          isLoading ? 'cursor-not-allowed scale-100' : ''
        }`}
        aria-label='Delete record'
        disabled={isLoading} // Disable button while loading
        title='Delete expense record'
      >
        {isLoading ? (
          <div className='w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin'></div>
        ) : (
          <svg
            className='w-3 h-3 sm:w-4 sm:h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        )}
      </button>

      {/* Content area with proper spacing */}
      <div className='flex-1 flex flex-col justify-between'>
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-gray-505 tracking-wider uppercase'>
              {new Date(record?.date).toLocaleDateString()}
            </span>
            <span className='text-base sm:text-lg font-black text-gray-900 dark:text-gray-100'>
              ₹{record?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-base sm:text-lg'>
              {getCategoryEmoji(record?.category)}
            </span>
            <span className='text-sm font-bold text-gray-700 dark:text-gray-300'>
              {record?.category}
            </span>
          </div>
        </div>

        <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2.5 font-medium'>
          <p className='truncate break-words line-clamp-2'>{record?.text}</p>
        </div>
      </div>
    </li>
  );
};

export default RecordItem;