import React, { useState, useRef, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useStore } from '../store/useStore';

export const Header: React.FC = () => {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, dd/MM', { locale: vi });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  const { isMuted, toggleMute } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-8 max-w-2xl mx-auto w-full relative">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Focus Flow
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          {capitalizedDate}
        </p>
      </div>

      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 -mr-2 transition-colors rounded-full ${showSettings ? 'text-zinc-800 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        >
          <Settings className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={toggleMute}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 text-sm font-medium"
            >
              <span>Âm thanh Tinh xảo</span>
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-green-500" />}
            </button>
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 text-sm font-medium"
            >
              <span>Giao diện Tối</span>
              <Moon className="w-4 h-4 text-zinc-400 dark:hidden" />
              <Sun className="w-4 h-4 text-yellow-500 hidden dark:block" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
