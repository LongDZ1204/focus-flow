import React, { useState } from 'react';
import { useStore, type Task } from '../store/useStore';

interface DailyReviewModalProps {
  unreviewedTasks: Task[];
  onResolved: () => void;
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({ unreviewedTasks, onResolved }) => {
  const { resolveDailyReset } = useStore();
  const [decisions, setDecisions] = useState<Record<string, 'keep' | 'discard'>>({});

  const isAllDecided = unreviewedTasks.every(t => decisions[t.id] !== undefined);

  const handleComplete = () => {
    if (!isAllDecided) return;
    const carryOverIds = Object.entries(decisions)
      .filter(([_, decision]) => decision === 'keep')
      .map(([id]) => id);
    resolveDailyReset(carryOverIds);
    onResolved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Review Ngày Hôm Qua</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Bạn còn vài việc chưa hoàn thành. Hãy quyết định giữ lại cho hôm nay hay loại bỏ chúng để có một khởi đầu mới (Zero-backlog).
          </p>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-3 pr-2 custom-scrollbar">
          {unreviewedTasks.map(task => (
            <div key={task.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate flex-1">
                {task.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDecisions(prev => ({ ...prev, [task.id]: 'discard' }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    decisions[task.id] === 'discard' 
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Xóa bỏ
                </button>
                <button
                  onClick={() => setDecisions(prev => ({ ...prev, [task.id]: 'keep' }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    decisions[task.id] === 'keep' 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  Giữ lại
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={!isAllDecided}
          className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98]"
        >
          Xác nhận đóng ngày cũ
        </button>
      </div>
    </div>
  );
};
