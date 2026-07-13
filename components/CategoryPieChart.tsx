'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '@/contexts/ThemeContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Record {
  date: string;
  amount: number;
  category: string;
}

const CategoryPieChart = ({ records }: { records: Record[] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Aggregate expenses by category
  const categoryData: { [key: string]: number } = {};
  let totalAmount = 0;

  records.forEach((record) => {
    const category = record.category || 'Other';
    categoryData[category] = (categoryData[category] || 0) + record.amount;
    totalAmount += record.amount;
  });

  const categories = Object.keys(categoryData);
  const amounts = Object.values(categoryData);

  // Premium color mappings for categories
  const categoryColors: { [key: string]: { bg: string; border: string; label: string } } = {
    Food: {
      bg: 'rgba(91, 192, 190, 0.7)', // Cyan
      border: 'rgba(91, 192, 190, 1)',
      label: '🍔 Food & Dining',
    },
    Transportation: {
      bg: 'rgba(14, 165, 233, 0.7)', // Sky
      border: 'rgba(14, 165, 233, 1)',
      label: '🚗 Transportation',
    },
    Shopping: {
      bg: 'rgba(245, 158, 11, 0.7)', // Amber
      border: 'rgba(245, 158, 11, 1)',
      label: '🛒 Shopping',
    },
    Entertainment: {
      bg: 'rgba(236, 72, 153, 0.7)', // Pink
      border: 'rgba(236, 72, 153, 1)',
      label: '🎬 Entertainment',
    },
    Bills: {
      bg: 'rgba(234, 179, 8, 0.7)', // Yellow
      border: 'rgba(234, 179, 8, 1)',
      label: '💡 Bills & Utilities',
    },
    Healthcare: {
      bg: 'rgba(239, 68, 68, 0.7)', // Red
      border: 'rgba(239, 68, 68, 1)',
      label: '🏥 Healthcare',
    },
    Other: {
      bg: 'rgba(107, 114, 128, 0.7)', // Gray
      border: 'rgba(107, 114, 128, 1)',
      label: '📦 Other',
    },
  };

  const backgroundColors = categories.map(
    (cat) => categoryColors[cat]?.bg || 'rgba(156, 163, 175, 0.7)'
  );
  const borderColors = categories.map(
    (cat) => categoryColors[cat]?.border || 'rgba(156, 163, 175, 1)'
  );

  const data = {
    labels: categories.map((cat) => categoryColors[cat]?.label || cat),
    datasets: [
      {
        data: amounts,
        backgroundColor: backgroundColors,
        borderColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Use our custom legend below for perfect design control
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f9fafb' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            const val = context.raw;
            const pct = totalAmount > 0 ? ((val / totalAmount) * 100).toFixed(1) : '0';
            return ` ₹${val.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '65%', // Nice doughnut hole size
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-center gap-6 py-2'>
      {/* Doughnut Chart container */}
      <div className='relative w-44 h-44 sm:w-48 sm:h-48 flex-shrink-0'>
        <Doughnut data={data} options={options} />
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
          <span className='text-[10px] sm:text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider'>
            Total
          </span>
          <span className='text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight'>
            ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full'>
        {categories.map((cat, idx) => {
          const val = categoryData[cat];
          const pct = totalAmount > 0 ? ((val / totalAmount) * 100).toFixed(0) : '0';
          const styling = categoryColors[cat] || { border: '#6b7280', label: cat };
          
          return (
            <div 
              key={idx}
              className='flex items-center justify-between p-2 rounded-xl bg-gray-50/50 dark:bg-theme-dark/40 border border-gray-150/10 dark:border-white/5 hover:bg-gray-100/30 dark:hover:bg-theme-plum/60 transition-colors duration-200'
            >
              <div className='flex items-center gap-2 min-w-0'>
                <span 
                  className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                  style={{ backgroundColor: styling.border }}
                ></span>
                <span className='text-xs font-bold text-gray-700 dark:text-gray-300 truncate'>
                  {styling.label}
                </span>
              </div>
              <div className='text-right pl-2 flex-shrink-0'>
                <span className='text-xs font-black text-gray-900 dark:text-gray-100'>
                  ₹{val.toFixed(0)}
                </span>
                <span className='text-[9px] text-gray-400 dark:text-gray-505 block font-semibold'>
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPieChart;
