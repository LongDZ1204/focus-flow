import React, { useState } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store/useStore';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';

const QUOTES = [
  "Cho đến khi điều quan trọng nhất được thực hiện - mọi thứ khác đều gây xao nhãng.",
  "Điều quan trọng nhất = Kết quả đáng ngạc nhiên.",
  "Thói quen thành công sẽ giúp bạn đạt được mục tiêu của mình.",
  "Nước tĩnh trong thì nhìn thấy đáy, tâm tĩnh lặng thì nhìn thấy hướng đi.",
  "Tập trung vào hiện tại là chiếc chìa khóa duy nhất để mở cánh cửa tương lai.",
  "Chỉ làm một việc mà làm thật tốt, đó chính là đẳng cấp.",
  "Không có ngày hôm qua để luyến tiếc, chỉ có hôm nay để hành động.",
  "The One Thing - Hãy biến hôm nay thành kiệt tác."
];

export const TaskList: React.FC = () => {
  const { tasks, reorderTasks, addTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [estimatedMins, setEstimatedMins] = useState('25');

  const activeTasks = tasks.filter(t => t.status !== 'archived' && !t.isTheOneThing);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderTasks(result.source.index, result.destination.index);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), parseInt(estimatedMins) || 25);
      setNewTaskTitle('');
    }
  };

  const randomQuote = React.useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="w-full mx-auto px-4 max-w-2xl relative pb-24 md:pb-0">
      <form onSubmit={handleAdd} className="flex gap-2 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl fixed bottom-6 left-4 right-4 z-50 md:static md:p-0 md:bg-transparent md:dark:bg-transparent md:border-none md:shadow-none md:mb-8">
        <input 
          type="text" 
          placeholder="Thêm nhiệm vụ mới..." 
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all placeholder:text-zinc-400 font-medium"
        />
        <input 
          type="number" 
          min="1"
          value={estimatedMins}
          onChange={e => setEstimatedMins(e.target.value)}
          className="w-20 px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all text-center font-medium"
          title="Phút dự kiến"
        />
        <button type="submit" className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="task-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="min-h-[200px]"
            >
              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-zinc-500 dark:text-zinc-400 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center rotate-12 shadow-sm">
                    <span className="text-3xl">☕</span>
                  </div>
                  <p className="italic text-sm my-2 max-w-sm">"{randomQuote}"</p>
                  <p className="text-xs mt-3 uppercase tracking-wider font-semibold opacity-60">Hãy liệt kê công việc đầu tiên nhé!</p>
                </div>
              ) : (
                activeTasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index} />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
