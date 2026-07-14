'use client';
import { useRef, useState } from 'react';
import addExpenseRecord from '@/app/actions/addExpenseRecord';
import { suggestCategory } from '@/app/actions/suggestCategory';

const CATEGORIES = [
  { value: 'Food', label: '🍔 Food & Dining' },
  { value: 'Transportation', label: '🚗 Transportation' },
  { value: 'Shopping', label: '🛒 Shopping' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Bills', label: '💡 Bills & Utilities' },
  { value: 'Healthcare', label: '🏥 Healthcare' },
  { value: 'Other', label: '📦 Other' },
];

const AddRecord = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(100);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);
  const [recordType, setRecordType] = useState<'expense' | 'income'>('expense');

  const clientAction = async (formData: FormData) => {
    setIsLoading(true);
    setAlertMessage(null);

    formData.set('amount', amount.toString());
    formData.set('type', recordType);
    if (recordType === 'expense') {
      formData.set('category', category);
    }

    const { error } = await addExpenseRecord(formData);

    if (error) {
      setAlertMessage(`Error: ${error}`);
      setAlertType('error');
    } else {
      setAlertMessage(
        recordType === 'income'
          ? 'Income record added successfully!'
          : 'Expense record added successfully!'
      );
      setAlertType('success');
      formRef.current?.reset();
      setAmount(100);
      setCategory('');
      setDescription('');
    }

    setIsLoading(false);
  };

  const handleAISuggestCategory = async () => {
    if (!description.trim()) {
      setAlertMessage('Please enter a description first');
      setAlertType('error');
      return;
    }

    setIsCategorizingAI(true);
    setAlertMessage(null);

    try {
      const result = await suggestCategory(description);
      if (result.error) {
        setAlertMessage(`AI Suggestion: ${result.error}`);
        setAlertType('error');
      } else {
        setCategory(result.category);
        setAlertMessage(`AI suggested category: ${result.category}`);
        setAlertType('success');
      }
    } catch {
      setAlertMessage('Failed to get AI category suggestion');
      setAlertType('error');
    } finally {
      setIsCategorizingAI(false);
    }
  };

  const isIncome = recordType === 'income';

  return (
    <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-300'>
      {/* Header */}
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5'>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${isIncome ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/15' : 'bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted shadow-theme-cyan/15'}`}>
          <span className='text-white text-sm sm:text-lg'>{isIncome ? '💰' : '💳'}</span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight'>
            {isIncome ? 'Add Income' : 'Add New Expense'}
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
            {isIncome ? 'Record your earnings and income' : 'Track your spending with AI assistance'}
          </p>
        </div>
      </div>

      {/* Expense / Income Toggle */}
      <div className='flex gap-1 p-1 bg-gray-100/60 dark:bg-theme-deep/60 rounded-xl border border-gray-150/30 dark:border-white/5 mb-5'>
        <button
          type='button'
          onClick={() => { setRecordType('expense'); setCategory(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${!isIncome ? 'bg-white dark:bg-theme-dark shadow-sm text-red-600 dark:text-red-400 border border-gray-150/50 dark:border-white/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          💸 Expense
        </button>
        <button
          type='button'
          onClick={() => { setRecordType('income'); setCategory(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${isIncome ? 'bg-white dark:bg-theme-dark shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-150/50 dark:border-white/5' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          💰 Income
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          clientAction(formData);
        }}
        className='space-y-4 sm:space-y-5'
      >
        {/* Description and Date */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-gray-55/30 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 rounded-xl border border-gray-150/20 dark:border-[#1c2541]/60'>
          {/* Description */}
          <div className='space-y-1.5'>
            <label htmlFor='text' className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'>
              <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-theme-cyan'}`}></span>
              {isIncome ? 'Income Source' : 'Expense Description'}
            </label>
            <div className='relative'>
              <input
                type='text'
                id='text'
                name='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='w-full pl-3 pr-12 sm:pr-14 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm hover:shadow-md transition-all duration-200'
                placeholder={isIncome ? 'Salary, freelance, dividends...' : 'Coffee, groceries, gas...'}
                required
              />
              {!isIncome && (
                <button
                  type='button'
                  onClick={handleAISuggestCategory}
                  disabled={isCategorizingAI || !description.trim()}
                  className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-7 bg-theme-cyan/15 hover:bg-theme-cyan/25 disabled:bg-gray-100 dark:disabled:bg-white/5 text-theme-cyan disabled:text-gray-400 border border-theme-cyan/25 dark:border-theme-cyan/20 rounded-lg text-xs font-medium flex items-center justify-center shadow-sm hover:shadow-md disabled:shadow-none transition-all duration-200 active:scale-95 cursor-pointer'
                  title='AI Category Suggestion'
                >
                  {isCategorizingAI ? (
                    <div className='w-3 h-3 border-2 border-theme-cyan/30 border-t-theme-cyan rounded-full animate-spin'></div>
                  ) : (
                    <span className='text-xs'>✨</span>
                  )}
                </button>
              )}
            </div>
            {isCategorizingAI && (
              <div className='flex items-center gap-2 text-xs text-theme-cyan dark:text-cyan-400'>
                <div className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></div>
                AI is analyzing your description...
              </div>
            )}
          </div>

          {/* Date */}
          <div className='space-y-1.5'>
            <label htmlFor='date' className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'>
              <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-theme-cyan'}`}></span>
              Date
            </label>
            <input
              type='date'
              name='date'
              id='date'
              className='w-full px-3 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 text-sm shadow-sm hover:shadow-md transition-all duration-200'
              required
              onFocus={(e) => e.target.showPicker()}
            />
          </div>
        </div>

        {/* Category (expense only) and Amount */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-gray-55/30 dark:from-theme-deep/30 dark:to-theme-dark/30 rounded-xl border border-gray-150/20 dark:border-[#1c2541]/60'>
          {/* Category (expense only) */}
          {!isIncome && (
            <div className='space-y-1.5'>
              <label htmlFor='category' className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'>
                <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
                Category
                <span className='text-xs text-gray-400 dark:text-gray-505 ml-2 font-normal hidden sm:inline'>
                  Use the ✨ button for AI suggestions
                </span>
              </label>
              <select
                id='category'
                name='category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full px-3 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 cursor-pointer text-sm shadow-sm hover:shadow-md transition-all duration-200'
                required={!isIncome}
              >
                <option value='' disabled className='text-gray-450 dark:text-gray-500'>
                  Select category...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className='text-gray-900 dark:text-gray-100'>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div className={`space-y-1.5 ${isIncome ? 'md:col-span-2' : ''}`}>
            <label htmlFor='amount' className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'>
              <span className={`w-1.5 h-1.5 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-theme-cyan'}`}></span>
              Amount
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm'>
                ₹
              </span>
              <input
                type='number'
                name='amount'
                id='amount'
                min='1'
                step='0.01'
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className='w-full pl-6 pr-3 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200'
                placeholder='0.00'
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className={`w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl font-bold shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.98] transition-all duration-300 text-sm sm:text-base cursor-pointer border ${isIncome ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/20 hover:shadow-emerald-500/30' : 'bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] border-theme-cyan/20 hover:shadow-theme-cyan/30'}`}
          disabled={isLoading}
        >
          <div className='relative flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <div className={`w-4 h-4 border-2 rounded-full animate-spin ${isIncome ? 'border-white/30 border-t-white' : 'border-[#0b132b]/30 border-t-[#0b132b]'}`}></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className='text-lg'>{isIncome ? '💰' : '💳'}</span>
                <span>{isIncome ? 'Add Income' : 'Add Expense'}</span>
              </>
            )}
          </div>
        </button>
      </form>

      {/* Alert Message */}
      {alertMessage && (
        <div className={`mt-4 p-3 rounded-xl border-l-4 backdrop-blur-sm ${alertType === 'success' ? (isIncome ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-l-emerald-500 text-gray-800 dark:text-emerald-200' : 'bg-theme-cyan/10 dark:bg-theme-dark/20 border-l-theme-cyan text-gray-800 dark:text-cyan-200') : 'bg-red-50/80 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-200'}`}>
          <div className='flex items-center gap-2'>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${alertType === 'success' ? (isIncome ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-theme-cyan/20 dark:bg-theme-muted/40') : 'bg-red-100 dark:bg-red-800'}`}>
              <span className='text-sm'>{alertType === 'success' ? '✅' : '⚠️'}</span>
            </div>
            <p className='font-medium text-sm'>{alertMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecord;