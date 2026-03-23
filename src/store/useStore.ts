import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export interface Task {
  id: string; // UUID
  title: string;
  isTheOneThing: boolean;
  estimatedMinutes: number; // Thời gian ước tính (phút)
  actualSecondsSpent: number; // Thời gian thực tế đã làm (giây)
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  createdAt: number; // Timestamp lúc tạo
  completedAt: number | null; // Timestamp lúc hoàn thành
}

export interface AppState {
  tasks: Task[];
  lastResetDate: string; // "YYYY-MM-DD"
  isZenModeActive: boolean;
  activeTaskId: string | null;
  isMuted: boolean;
  // Actions
  toggleMute: () => void;
  addTask: (title: string, estimatedMinutes: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  setZenMode: (isActive: boolean, taskId: string | null) => void;
  updateTimer: (id: string, secondsToAdd: number) => void;
  pinAsOneThing: (id: string) => void;
  checkDailyReset: () => Task[]; // returns old incomplete tasks
  resolveDailyReset: (carryOverTaskIds: string[]) => void;
}

const generateId = () => crypto.randomUUID();
const todayString = () => format(new Date(), 'yyyy-MM-dd');

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastResetDate: todayString(),
      isZenModeActive: false,
      activeTaskId: null,
      isMuted: false,

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      addTask: (title, estimatedMinutes) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              isTheOneThing: false,
              estimatedMinutes,
              actualSecondsSpent: 0,
              status: 'todo',
              createdAt: Date.now(),
              completedAt: null,
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              const updated = { ...task, ...updates };
              // auto-set completedAt based on status
              if (updates.status === 'completed' && task.status !== 'completed') {
                updated.completedAt = Date.now();
              }
              return updated;
            }
            return task;
          }),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
          isZenModeActive: state.activeTaskId === id ? false : state.isZenModeActive,
        })),

      reorderTasks: (activeStartIndex, activeEndIndex) =>
        set((state) => {
          const activeTasks = state.tasks.filter(t => t.status !== 'archived' && !t.isTheOneThing);
          const draggedTask = activeTasks[activeStartIndex];
          
          if (!draggedTask) return state;

          const newTasks = state.tasks.filter(t => t.id !== draggedTask.id);
          const remainingActive = newTasks.filter(t => t.status !== 'archived' && !t.isTheOneThing);
          const insertBeforeTask = remainingActive[activeEndIndex];
          
          if (insertBeforeTask) {
             const globalIndex = newTasks.findIndex(t => t.id === insertBeforeTask.id);
             newTasks.splice(globalIndex, 0, draggedTask);
          } else {
             newTasks.push(draggedTask);
          }

          return { tasks: newTasks };
        }),

      setZenMode: (isActive, taskId) =>
        set(() => ({
          isZenModeActive: isActive,
          activeTaskId: Math.max(0, 1) ? taskId : null, // keep value truthy but assign
        })),

      updateTimer: (id, secondsToAdd) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, actualSecondsSpent: task.actualSecondsSpent + secondsToAdd }
              : task
          ),
        })),

      pinAsOneThing: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          const isCurrentlyPinned = task?.isTheOneThing;

          return {
            tasks: state.tasks.map((t) => ({
              ...t,
              isTheOneThing: t.id === id ? !isCurrentlyPinned : false,
            })),
          };
        }),

      checkDailyReset: () => {
        const state = get();
        const currentDate = todayString();
        
        if (state.lastResetDate !== currentDate) {
          return state.tasks.filter(
            (t) => t.status === 'todo' || t.status === 'in-progress'
          );
        }
        return [];
      },

      resolveDailyReset: (carryOverTaskIds) =>
        set((state) => {
          const newTasks = state.tasks
            .map((t) => {
              if (t.status === 'completed') {
                return { ...t, status: 'archived' as const };
              }
              if (t.status === 'todo' || t.status === 'in-progress') {
                if (carryOverTaskIds.includes(t.id)) {
                  return t;
                }
                return null; // Not carried over = delete
              }
              return t; // archived remain archived
            })
            .filter((t): t is Task => t !== null);

          return {
            tasks: newTasks,
            lastResetDate: todayString(),
          };
        }),
    }),
    {
      name: 'focus-flow-storage',
      partialize: (state) => ({ 
        tasks: state.tasks, 
        lastResetDate: state.lastResetDate,
        isMuted: state.isMuted,
      }),
    }
  )
);
