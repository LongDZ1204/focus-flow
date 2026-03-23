import { useEffect, useState } from 'react';
import { useStore, type Task } from './store/useStore';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TaskList } from './components/TaskList';
import { DailyReviewModal } from './components/DailyReviewModal';
import { ZenMode } from './components/ZenMode';

function App() {
  const { checkDailyReset } = useStore();
  const [unreviewedTasks, setUnreviewedTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Run exactly once on mount
    const pending = checkDailyReset();
    if (pending.length > 0) {
      setUnreviewedTasks(pending);
    }
  }, [checkDailyReset]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-yellow-200 dark:selection:bg-yellow-900/30 relative">
      <Header />
      
      <main className="pb-24 pt-4">
        <HeroSection />
        <TaskList />
      </main>

      {unreviewedTasks.length > 0 && (
        <DailyReviewModal 
          unreviewedTasks={unreviewedTasks} 
          onResolved={() => setUnreviewedTasks([])} 
        />
      )}
      <ZenMode />
    </div>
  );
}

export default App;
