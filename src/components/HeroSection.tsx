import React from 'react';
import { useStore } from '../store/useStore';
import { Crown, CheckCircle2, Play, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/audio';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const { tasks, updateTask, setZenMode, deleteTask } = useStore();
  
  const theOneThing = tasks.find(t => t.isTheOneThing && t.status !== 'archived');

  if (!theOneThing) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 mb-8">
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 mx-auto flex items-center justify-center mb-4">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-2">
            Chưa có Điều Quan Trọng Nhất
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
            Bấm vào biểu tượng vương miện ở một công việc bên dưới để đưa nó lên đây. Khởi đầu ngày mới bằng việc tập trung hoàn thành nó trước tiên!
          </p>
        </div>
      </div>
    );
  }

  const toggleComplete = () => {
    const isNowCompleted = theOneThing.status !== 'completed';
    updateTask(theOneThing.id, { 
      status: isNowCompleted ? 'completed' : 'todo' 
    });
    
    if (isNowCompleted) {
      playSuccessSound();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#eab308', '#22c55e', '#3b82f6'],
        disableForReducedMotion: true
      });
    }
  };

  const isCompleted = theOneThing.status === 'completed';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto px-4 mb-8"
    >
      <div className={cn(
        "relative group overflow-hidden rounded-2xl border-2 p-6 shadow-sm transition-colors duration-500 hover:shadow-md",
        isCompleted 
          ? "border-green-400/50 dark:border-green-500/30 bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-zinc-900" 
          : "border-yellow-400/50 dark:border-yellow-500/30 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/10 dark:to-zinc-900"
      )}>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5",
              isCompleted 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500" 
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500"
            )}>
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
              {isCompleted ? "Đã Hoàn Thành" : "The One Thing"}
            </span>
          </div>
          
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold leading-tight transition-colors",
            isCompleted 
              ? "text-zinc-400 dark:text-zinc-500 line-through" 
              : "text-zinc-900 dark:text-zinc-100"
          )}>
            {theOneThing.title}
          </h2>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              {!isCompleted && (
                <button 
                  onClick={() => setZenMode(true, theOneThing.id)}
                  className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-95 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Bắt đầu
                </button>
              )}
              <button 
                onClick={toggleComplete}
                className={cn(
                  "p-2.5 rounded-xl border shadow-sm transition-colors active:scale-95 flex items-center gap-2",
                  isCompleted 
                    ? "text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700" 
                    : "text-green-600 dark:text-green-500 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800"
                )}
                title={isCompleted ? "Hoàn tác" : "Đánh dấu hoàn thành"}
              >
                <CheckCircle2 className="w-5 h-5" />
                {isCompleted && <span className="text-sm font-medium pr-1">Hoàn tác</span>}
              </button>

              <button 
                onClick={() => deleteTask(theOneThing.id)}
                className="p-2.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 shadow-sm transition-colors active:scale-95"
                title="Xoá công việc trọng tâm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
