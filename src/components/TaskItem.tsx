import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore, type Task } from '../store/useStore';
import { Crown, Play, CheckCircle2, Circle, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface TaskItemProps {
  task: Task;
  index: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index }) => {
  const { updateTask, pinAsOneThing, setZenMode, deleteTask } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const toggleComplete = () => {
    updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  };

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (title.trim() !== task.title) {
      updateTask(task.id, { title: title.trim() || 'Untitled Task' });
    }
  };

  const pad = (num: number) => num.toString().padStart(2, '0');
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "group flex items-center gap-3 p-3 mb-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all",
            snapshot.isDragging && "shadow-lg border-zinc-300 dark:border-zinc-700 ring-2 ring-zinc-500/20",
            task.status === 'completed' && "opacity-60 bg-zinc-50 dark:bg-zinc-900/50"
          )}
        >
          {/* Drag Handle */}
          <div {...provided.dragHandleProps} className="text-zinc-400 cursor-grab active:cursor-grabbing hover:text-zinc-600 dark:hover:text-zinc-300">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Checkbox */}
          <button onClick={toggleComplete} className="text-zinc-400 hover:text-green-500 transition-colors shrink-0">
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 outline-none px-1 py-0.5 text-zinc-900 dark:text-zinc-100"
              />
            ) : (
              <p 
                onClick={() => setIsEditing(true)}
                className={cn(
                  "truncate cursor-text text-zinc-800 dark:text-zinc-200 font-medium",
                  task.status === 'completed' && "line-through text-zinc-500 dark:text-zinc-500 font-normal"
                )}
              >
                {task.title}
              </p>
            )}
          </div>

          {/* Time & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-md">
              {formatTime(task.actualSecondsSpent)} / {task.estimatedMinutes}m
            </div>
            
            <button 
              onClick={() => pinAsOneThing(task.id)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                task.isTheOneThing 
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 opacity-100" 
                  : "text-zinc-400 hover:text-yellow-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:opacity-100"
              )}
              title="Pin as The One Thing"
            >
              <Crown className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setZenMode(true, task.id)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors focus:opacity-100"
              title="Start Timer"
            >
              <Play className="w-4 h-4" />
            </button>

            <button 
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors focus:opacity-100"
              title="Xoá nhiệm vụ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
