'use client';

import { useState, useEffect } from 'react';
import { getAIInsights } from '@/app/actions/getAIInsights';
import { generateInsightAnswer } from '@/app/actions/generateInsightAnswer';

interface InsightData {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence?: number;
}

interface AIAnswer {
  insightId: string;
  answer: string;
  isLoading: boolean;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiAnswers, setAiAnswers] = useState<AIAnswer[]>([]);

  // Custom chat states
  const [customQuestion, setCustomQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const newInsights = await getAIInsights();
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ AIInsights: Failed to load AI insights:', error);
      setInsights([
        {
          id: 'fallback-1',
          type: 'info',
          title: 'AI Temporarily Unavailable',
          message: "We're working to restore AI insights. Please check back soon.",
          action: 'Try again later',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (insight: InsightData) => {
    if (!insight.action) return;

    const existingAnswer = aiAnswers.find((a) => a.insightId === insight.id);
    if (existingAnswer) {
      setAiAnswers((prev) => prev.filter((a) => a.insightId !== insight.id));
      return;
    }

    setAiAnswers((prev) => [
      ...prev,
      {
        insightId: insight.id,
        answer: '',
        isLoading: true,
      },
    ]);

    try {
      const question = `${insight.title}: ${insight.action}`;
      const answer = await generateInsightAnswer(question);

      setAiAnswers((prev) =>
        prev.map((a) =>
          a.insightId === insight.id ? { ...a, answer, isLoading: false } : a
        )
      );
    } catch (error) {
      console.error('❌ Failed to generate AI answer:', error);
      setAiAnswers((prev) =>
        prev.map((a) =>
          a.insightId === insight.id
            ? {
                ...a,
                answer: 'Sorry, I was unable to generate a detailed answer. Please try again.',
                isLoading: false,
              }
            : a
        )
      );
    }
  };

  const handleCustomQuestionSubmit = async (e?: React.FormEvent, predefinedQuestion?: string) => {
    if (e) e.preventDefault();
    
    const questionToAsk = predefinedQuestion || customQuestion;
    if (!questionToAsk.trim()) return;

    setIsChatLoading(true);
    if (!predefinedQuestion) setCustomQuestion('');

    // Add loading placeholder to chat history
    const tempId = `chat-temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      question: questionToAsk,
      answer: '',
      timestamp: new Date(),
    };
    
    setChatHistory((prev) => [...prev, newMsg]);

    try {
      const answer = await generateInsightAnswer(questionToAsk);
      
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, answer } : msg
        )
      );
    } catch (error) {
      console.error('❌ Failed to generate custom AI answer:', error);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                answer: 'Apologies, I encountered an error checking your transactions. Please try again.',
              }
            : msg
        )
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'tip':
        return '💡';
      case 'info':
        return 'ℹ️';
      default:
        return '🤖';
    }
  };

  const getInsightColors = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/70 dark:bg-yellow-950/15';
      case 'success':
        return 'border-l-theme-cyan bg-theme-cyan/5 dark:bg-theme-cyan/5';
      case 'tip':
        return 'border-l-theme-cyan bg-theme-cyan/5 dark:bg-theme-cyan/5';
      case 'info':
        return 'border-l-theme-cyan bg-theme-cyan/5 dark:bg-theme-cyan/5';
      default:
        return 'border-l-gray-500 bg-gray-50/70 dark:bg-theme-dark/40';
    }
  };

  const getButtonColors = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-450 hover:text-yellow-800 dark:hover:text-yellow-300';
      case 'success':
        return 'text-theme-cyan dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300';
      case 'tip':
        return 'text-theme-cyan dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300';
      case 'info':
        return 'text-theme-cyan dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300';
      default:
        return 'text-gray-700 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-250';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Loading...';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className='glass-card p-6 rounded-2xl shadow-xl border border-gray-150/40 dark:border-white/5 relative overflow-hidden transition-all duration-300'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-gradient-to-br from-theme-cyan via-cyan-400 to-theme-muted rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
            <span className='text-white text-base'>🤖</span>
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>AI Insights</h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Analyzing your spending patterns</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 border-2 border-theme-cyan/30 border-t-theme-cyan rounded-full animate-spin'></div>
          </div>
        </div>

        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='animate-pulse bg-gray-50 dark:bg-theme-deep/50 p-4 rounded-2xl border border-gray-150/20 dark:border-[#1c2541]/60'>
              <div className='flex items-start gap-4'>
                <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2'></div>
                  <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-full'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 1. Card-based Insights */}
      <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
              <span className='text-white text-base'>🤖</span>
            </div>
            <div>
              <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100'>AI Financial Insights</h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium'>Pattern analysis for the last 30 days</p>
            </div>
          </div>
          
          <div className='flex items-center gap-2'>
            <div className='inline-flex items-center gap-1.5 bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-theme-cyan dark:text-cyan-300 px-2.5 py-1 rounded-full text-[10px] font-bold border border-theme-cyan/20 dark:border-white/5'>
              <span className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-pulse'></span>
              <span>{formatLastUpdated()}</span>
            </div>
            <button
               onClick={loadInsights}
               className='w-7.5 h-7.5 bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:border-theme-cyan/40 dark:hover:border-theme-cyan/30 text-gray-655 dark:text-gray-350 hover:text-theme-cyan dark:hover:text-cyan-300 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95 cursor-pointer'
               disabled={isLoading}
               title='Refresh Insights'
             >
               <span className='text-xs'>🔄</span>
             </button>
          </div>
        </div>

        {/* Grid of Insight Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {insights.map((insight) => {
            const currentAnswer = aiAnswers.find((a) => a.insightId === insight.id);

            return (
              <div
                key={insight.id}
                className={`relative overflow-hidden rounded-2xl p-4 border-l-4 hover:shadow-lg transition-all duration-200 border border-gray-150/15 dark:border-white/5 ${getInsightColors(
                  insight.type
                )}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2.5 mb-2'>
                      <div className='w-7.5 h-7.5 rounded-lg bg-white/70 dark:bg-theme-deep/50 flex items-center justify-center shadow-sm flex-shrink-0'>
                        <span className='text-base'>{getInsightIcon(insight.type)}</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-gray-900 dark:text-gray-100 text-sm truncate'>
                          {insight.title}
                        </h4>
                      </div>
                    </div>
                    
                    <p className='text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-3.5 font-medium'>
                      {insight.message}
                    </p>
                    
                    {insight.action && (
                      <div className='text-left'>
                        <button
                           onClick={() => handleActionClick(insight)}
                           className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer transition-all duration-200 bg-white/80 hover:bg-white dark:bg-theme-dark/60 dark:hover:bg-gray-900 shadow-sm border border-gray-200/50 dark:border-white/5 active:scale-[0.97] ${getButtonColors(
                             insight.type
                           )}`}
                         >
                          <span>{insight.action}</span>
                          {currentAnswer?.isLoading ? (
                            <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                          ) : (
                            <span className='text-xs'>{currentAnswer ? '↑' : '→'}</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {insight.confidence && (
                    <span className='text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400'>
                      {Math.round(insight.confidence * 100)}% Match
                    </span>
                  )}
                </div>

                {/* Insight detailed answer */}
                {currentAnswer && (
                  <div className='mt-4 pt-3.5 border-t border-gray-200/50 dark:border-white/5 text-xs text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-black/10 rounded-xl p-3.5 animate-slide-up'>
                    {currentAnswer.isLoading ? (
                      <div className='flex items-center gap-2 text-gray-450 font-bold'>
                        <div className='w-3.5 h-3.5 border-2 border-theme-cyan/30 border-t-theme-cyan rounded-full animate-spin'></div>
                        <span>Generating deep advice...</span>
                      </div>
                    ) : (
                      <div className='leading-relaxed font-semibold whitespace-pre-line'>
                        {currentAnswer.answer}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive AI Chat Assistant */}
      <div className='glass-card p-4 sm:p-6 rounded-2xl border border-gray-150/40 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-9 h-9 bg-gradient-to-br from-theme-cyan via-cyan-400 to-[#3a506b] rounded-xl flex items-center justify-center shadow-lg shadow-theme-cyan/15'>
            <span className='text-white text-base'>💬</span>
          </div>
          <div>
            <h3 className='text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100'>Ask AI Assistant</h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium'>Inquire about budgets, summaries, or categories</p>
          </div>
        </div>

        {/* Chat Message list */}
        {chatHistory.length > 0 && (
          <div className='mb-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1'>
            {chatHistory.map((msg) => (
              <div key={msg.id} className='space-y-3.5'>
                {/* User message */}
                <div className='flex justify-end'>
                  <div className='bg-theme-cyan hover:bg-[#4ea8a6] text-[#0b132b] px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed font-bold max-w-[85%] shadow-sm relative overflow-hidden'>
                    {msg.question}
                  </div>
                </div>

                {/* AI message */}
                <div className='flex justify-start gap-2.5'>
                  <div className='w-7.5 h-7.5 rounded-lg bg-theme-cyan/10 flex items-center justify-center text-xs flex-shrink-0 shadow-sm border border-theme-cyan/20'>
                    🤖
                  </div>
                  <div className='bg-theme-cyan/10 dark:bg-[#1c2541]/40 text-gray-800 dark:text-cyan-200 px-4 py-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed font-semibold max-w-[85%] border border-theme-cyan/25 dark:border-[#1c2541]/60 shadow-sm relative overflow-hidden'>
                    {msg.answer === '' ? (
                      <div className='flex items-center gap-2 py-0.5'>
                        <div className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                        <div className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                        <div className='w-1.5 h-1.5 bg-theme-cyan rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      msg.answer
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Helper Questions */}
        <div className='mb-4 space-y-1.5'>
          <span className='text-[10px] uppercase font-black text-gray-400 dark:text-gray-505 tracking-wider block mb-2'>
            Suggested Questions
          </span>
          <div className='flex flex-wrap gap-2'>
            {[
              'Am I spending too much on Food?',
              'Where is most of my money going?',
              'How can I save ₹2,000 next month?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={(e) => handleCustomQuestionSubmit(e, q)}
                disabled={isChatLoading}
                className='text-[10px] sm:text-xs font-bold text-theme-cyan bg-theme-cyan/5 hover:bg-theme-cyan/15 dark:bg-theme-cyan/10 dark:hover:bg-theme-cyan/20 border border-theme-cyan/25 dark:border-theme-cyan/20 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-[0.97] shadow-sm disabled:opacity-50 cursor-pointer'
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleCustomQuestionSubmit} className='flex gap-2 relative mt-4'>
          <input
            type='text'
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder='Ask about your recent transactions...'
            className='flex-1 px-4 py-3 bg-white/70 dark:bg-theme-deep/50 border border-gray-250 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-theme-cyan/25 focus:bg-white dark:focus:bg-theme-dark/80 focus:border-theme-cyan dark:focus:border-theme-cyan text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-xs sm:text-sm shadow-sm transition-all duration-200'
            disabled={isChatLoading}
            required
          />
          <button
            type='submit'
            disabled={isChatLoading || !customQuestion.trim()}
            className='px-5 bg-gradient-to-r from-theme-cyan to-[#00B4D8] dark:from-[#5BC0BE] dark:to-[#0096B4] text-[#0b132b] rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg disabled:bg-gray-200 dark:disabled:bg-white/5 disabled:text-gray-505 border border-theme-cyan/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer'
          >
            {isChatLoading ? (
              <div className='w-4.5 h-4.5 border-2 border-[#0b132b]/30 border-t-[#0b132b] rounded-full animate-spin'></div>
            ) : (
              <>
                <span>Send</span>
                <span>✨</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIInsights;