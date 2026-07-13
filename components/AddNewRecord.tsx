'use client';
import { useRef, useState } from 'react';
import addExpenseRecord from '@/app/actions/addExpenseRecord';
import { suggestCategory } from '@/app/actions/suggestCategory';

const AddRecord = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(100); // Default value for expense amount
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // State for alert message
  const [alertType, setAlertType] = useState<'success' | 'error' | null>(null); // State for alert type
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [category, setCategory] = useState(''); // State for selected expense category
  const [description, setDescription] = useState(''); // State for expense description
  const [isCategorizingAI, setIsCategorizingAI] = useState(false); // State for AI categorization loading

  const clientAction = async (formData: FormData) => {
    setIsLoading(true); // Show spinner
    setAlertMessage(null); // Clear previous messages

    formData.set('amount', amount.toString()); // Add the amount value to the form data
    formData.set('category', category); // Add the selected category to the form data

    const { error } = await addExpenseRecord(formData); // Removed `data` since it's unused

    if (error) {
      setAlertMessage(`Error: ${error}`);
      setAlertType('error'); // Set alert type to error
    } else {
      setAlertMessage('Expense record added successfully!');
      setAlertType('success'); // Set alert type to success
      formRef.current?.reset();
      setAmount(100); // Reset the amount to the default value
      setCategory(''); // Reset the category
      setDescription(''); // Reset the description
    }

    setIsLoading(false); // Hide spinner
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

  return (
    <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 hover:shadow-2xl transition-all duration-300'>
      <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
        <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
          <span className='text-white text-sm sm:text-lg'>💳</span>
        </div>
        <div>
          <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight'>
            Add New Expense
          </h3>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
            Track your spending with AI assistance
          </p>
        </div>
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(formRef.current!);
          clientAction(formData);
        }}
        className='space-y-6 sm:space-y-8'
      >
        {/* Expense Description and Date */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-gray-55/30 dark:from-[#1c2541]/40 dark:to-[#0b132b]/40 rounded-xl border border-gray-150/20 dark:border-[#1c2541]/60'>
          {/* Expense Description */}
          <div className='space-y-1.5'>
            <label
              htmlFor='text'
              className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
            >
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Expense Description
            </label>
            <div className='relative'>
              <input
                type='text'
                id='text'
                name='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='w-full pl-3 pr-12 sm:pr-14 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm shadow-sm hover:shadow-md transition-all duration-200'
                placeholder='Coffee, groceries, gas...'
                required
              />
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
            </div>
            {isCategorizingAI && (
              <div className='flex items-center gap-2 text-xs text-theme-cyan dark:text-cyan-400'>
                <div className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></div>
                AI is analyzing your description...
              </div>
            )}
          </div>

          {/* Expense Date */}
          <div className='space-y-1.5'>
            <label
              htmlFor='date'
              className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
            >
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Expense Date
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

        {/* Category Selection and Amount */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50/50 to-gray-55/30 dark:from-theme-deep/30 dark:to-theme-dark/30 rounded-xl border border-gray-150/20 dark:border-[#1c2541]/60'>
          {/* Category Selection */}
          <div className='space-y-1.5'>
            <label
              htmlFor='category'
              className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
            >
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Category
              <span className='text-xs text-gray-400 dark:text-gray-505 ml-2 font-normal hidden sm:inline'>
                Use the ✨ button above for AI suggestions
              </span>
            </label>
            <select
              id='category'
              name='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='w-full px-3 py-2.5 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 cursor-pointer text-sm shadow-sm hover:shadow-md transition-all duration-200'
              required
            >
              <option
                value=''
                disabled
                className='text-gray-450 dark:text-gray-500'
              >
                Select category...
              </option>
              <option value='Food' className='text-gray-900 dark:text-gray-100'>
                🍔 Food & Dining
              </option>
              <option
                value='Transportation'
                className='text-gray-900 dark:text-gray-100'
              >
                🚗 Transportation
              </option>
              <option
                value='Shopping'
                className='text-gray-900 dark:text-gray-100'
              >
                🛒 Shopping
              </option>
              <option
                value='Entertainment'
                className='text-gray-900 dark:text-gray-100'
              >
                🎬 Entertainment
              </option>
              <option
                value='Bills'
                className='text-gray-900 dark:text-gray-100'
              >
                💡 Bills & Utilities
              </option>
              <option
                value='Healthcare'
                className='text-gray-900 dark:text-gray-100'
              >
                🏥 Healthcare
              </option>
              <option
                value='Other'
                className='text-gray-900 dark:text-gray-100'
              >
                📦 Other
              </option>
            </select>
          </div>

          {/* Amount */}
          <div className='space-y-1.5'>
            <label
              htmlFor='amount'
              className='flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide'
            >
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full'></span>
              Amount
              <span className='text-xs text-gray-400 dark:text-gray-505 ml-2 font-normal hidden sm:inline'>
                Enter amount between ₹100 and ₹10,005
              </span>
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm'>
                ₹
              </span>
              <input
                type='number'
                name='amount'
                id='amount'
                min='100'
                max='10000'
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
          className='w-full bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] px-4 py-3 sm:px-5 sm:py-4 rounded-xl font-bold shadow-xl hover:shadow-theme-cyan/30 border border-theme-cyan/20 hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-[0.98] transition-all duration-300 text-sm sm:text-base cursor-pointer'
          disabled={isLoading}
        >
          <div className='relative flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <div className='w-4 h-4 border-2 border-[#0b132b]/30 border-t-[#0b132b] rounded-full animate-spin'></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className='text-lg'>💳</span>
                <span>Add Expense</span>
              </>
            )}
          </div>
        </button>
      </form>

      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`mt-4 p-3 rounded-xl border-l-4 backdrop-blur-sm ${
            alertType === 'success'
              ? 'bg-theme-cyan/10 dark:bg-theme-dark/20 border-l-theme-cyan text-gray-800 dark:text-cyan-200'
              : 'bg-red-50/80 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-200'
          }`}
        >
          <div className='flex items-center gap-2'>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                alertType === 'success'
                  ? 'bg-theme-cyan/20 dark:bg-theme-muted/40'
                  : 'bg-red-100 dark:bg-red-800'
              }`}
            >
              <span className='text-sm'>
                {alertType === 'success' ? '✅' : '⚠️'}
              </span>
            </div>
            <p className='font-medium text-sm'>{alertMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecord;