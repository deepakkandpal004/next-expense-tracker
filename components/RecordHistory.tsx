import getRecords from '@/app/actions/getRecords';
import RecordHistoryList from './RecordHistoryList';

const RecordHistory = async () => {
  const { records, error } = await getRecords();

  if (error) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300'>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-905/20 dark:to-pink-905/20 border-l-4 border-l-red-500 p-3 sm:p-4 rounded-xl'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center'>
              <span className='text-base sm:text-lg'>⚠️</span>
            </div>
            <h4 className='font-bold text-red-800 dark:text-red-300 text-sm'>
              Error loading expense history
            </h4>
          </div>
          <p className='text-red-700 dark:text-red-400 ml-8 sm:ml-10 text-xs'>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300'>
        <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
            <span className='text-white text-sm sm:text-lg'>📝</span>
          </div>
          <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              Expense History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              Your spending timeline
            </p>
          </div>
        </div>
        <div className='text-center py-6 sm:py-8'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-theme-cyan/10 to-theme-muted/10 dark:from-theme-dark/40 dark:to-theme-deep/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-theme-cyan/10'>
            <span className='text-2xl sm:text-3xl'>📊</span>
          </div>
          <h4 className='text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2'>
            No Expense Records Found
          </h4>
          <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm'>
            Start tracking your expenses to see your spending history and
            patterns here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden'>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
          <span className='text-white text-sm sm:text-lg'>📝</span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent'>
            Expense History
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
            Your spending timeline
          </p>
        </div>
      </div>
      <RecordHistoryList records={records} />
    </div>
  );
};

export default RecordHistory;