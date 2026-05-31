import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useResume } from '../context/ResumeContext';
import type { ModuleConfig, ModuleType } from '../types';

interface DragItem {
  type: string;
  moduleType: ModuleType;
  index: number;
}

interface DraggableModuleItemProps {
  module: ModuleConfig;
  index: number;
  moveModule: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableModuleItem({ module, index, moveModule }: DraggableModuleItemProps) {
  const { state, dispatch } = useResume();
  const { activeModule } = state;

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: 'MODULE',
    item: () => {
      return { type: 'MODULE', moduleType: module.type, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem>({
    accept: 'MODULE',
    hover(item: DragItem) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveModule(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleClick = () => {
    dispatch({ type: 'SET_ACTIVE_MODULE', moduleType: module.type });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_MODULE_VISIBILITY', moduleType: module.type });
  };

  return (
    <div
      ref={ref}
      className={`module-item ${activeModule === module.type ? 'active' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      onClick={handleClick}
    >
      <span className="module-drag-handle">⋮⋮</span>
      <span className="module-title">{module.title}</span>
      <button
        type="button"
        className={`visibility-toggle ${module.visible ? 'visible' : 'hidden'}`}
        onClick={handleToggleVisibility}
        title={module.visible ? '点击隐藏' : '点击显示'}
      >
        {module.visible ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        )}
      </button>
    </div>
  );
}

export function ModuleList() {
  const { state, dispatch } = useResume();
  const { modules } = state;

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  const moveModule = (dragIndex: number, hoverIndex: number) => {
    const newModules = [...sortedModules];
    const dragModule = newModules[dragIndex];
    newModules.splice(dragIndex, 1);
    newModules.splice(hoverIndex, 0, dragModule);

    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    dispatch({ type: 'REORDER_MODULES', payload: reorderedModules });
  };

  return (
    <div className="module-list">
      <h4 className="module-list-title">模块列表</h4>
      <p className="module-list-hint">拖拽排序，点击编辑，眼睛图标控制显隐</p>
      <div className="module-list-container">
        {sortedModules.map((module, index) => (
          <DraggableModuleItem
            key={module.type}
            module={module}
            index={index}
            moveModule={moveModule}
          />
        ))}
      </div>
    </div>
  );
}
