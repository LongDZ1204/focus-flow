import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Pause } from 'lucide-react';
import { cn } from '../utils/cn';
import { playTingSound, playSuccessSound, startFocusMusic, stopFocusMusic } from '../utils/audio';

export const ZenMode: React.FC = () => {
  const { isZenModeActive, activeTaskId, tasks, setZenMode, updateTimer, updateTask } = useStore();
  
  const activeTask = tasks.find(t => t.id === activeTaskId);
  
  const workerRef = useRef<Worker | null>(null);
  const hasPlayedAlertRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setZenMode(false, null);
      }
    };

    if (!isZenModeActive || !activeTask) {
      if (workerRef.current) {
        workerRef.current.postMessage({ command: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
      stopFocusMusic();
      return;
    }

    workerRef.current = new Worker(new URL('../workers/timerWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        const secs = e.data.seconds;
        updateTimer(activeTask.id, secs);
      }
    };
    workerRef.current.postMessage({ command: 'start' });
    startFocusMusic();

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ command: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      window.removeEventListener('keydown', handleKeyDown);
      stopFocusMusic();
    };
  }, [isZenModeActive, activeTaskId, setZenMode, updateTimer]);

  const totalSeconds = activeTask?.actualSecondsSpent ?? 0;
  const estimatedSeconds = (activeTask?.estimatedMinutes ?? 0) * 60;
  const remainingSeconds = estimatedSeconds - totalSeconds;

  const isOvertime = remainingSeconds < 0;
  const displaySeconds = Math.abs(remainingSeconds);
  const m = Math.floor(displaySeconds / 60);
  const s = displaySeconds % 60;
  const pad = (num: number) => num.toString().padStart(2, '0');
  const timeString = `${pad(m)}:${pad(s)}`;

  useEffect(() => {
    if (isZenModeActive && activeTask && remainingSeconds <= 0 && !hasPlayedAlertRef.current && estimatedSeconds > 0) {
      playTingSound();
      hasPlayedAlertRef.current = true;
    }
    if (!isZenModeActive) {
      hasPlayedAlertRef.current = false;
    }
  }, [remainingSeconds, estimatedSeconds, isZenModeActive, activeTask]);

  useEffect(() => {
    if (isZenModeActive && activeTask) {
      document.title = `${isOvertime ? '+' : ''}${timeString} - ${activeTask.title}`;
    } else {
      document.title = 'Focus Flow';
    }
    return () => {
      document.title = 'Focus Flow';
    };
  }, [timeString, isOvertime, activeTask?.title, isZenModeActive]);

  // ALL HOOKS MUST BE ABOVE THIS EARLY RETURN!
  if (!isZenModeActive || !activeTask) return null;

  const handlePause = () => setZenMode(false, null);

  const handleComplete = () => {
    playSuccessSound();
    updateTask(activeTask.id, { status: 'completed' });
    setZenMode(false, null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-500">
      <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-16 max-w-4xl px-4 leading-tight">
        {activeTask.title}
      </h1>

      <div className={cn(
        "font-mono text-[15vw] leading-none mb-16 tracking-tighter transition-colors duration-1000",
        isOvertime ? "text-red-500 font-bold drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-white font-medium"
      )}>
        {isOvertime ? '+' : ''}{timeString}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={handlePause}
          className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all active:scale-90 shadow-lg"
          title="Tạm Dừng (Phím Space)"
        >
          <Pause className="w-8 h-8 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dừng</span>
        </button>

        <button 
          onClick={handleComplete}
          className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-white text-zinc-900 hover:bg-green-400 hover:scale-105 transition-all active:scale-90 shadow-xl"
        >
          <CheckCircle2 className="w-10 h-10 mb-1" />
          <span className="text-xs font-bold uppercase tracking-widest">Xong</span>
        </button>
      </div>

      <div className="absolute bottom-12 text-zinc-500 font-mono text-sm tracking-widest uppercase">
        Đã tập trung: {Math.floor(totalSeconds / 60)} phút {totalSeconds % 60} giây
      </div>
    </div>
  );
};
