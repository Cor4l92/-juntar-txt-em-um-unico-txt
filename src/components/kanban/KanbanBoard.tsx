import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Stage, Deal, Lead } from '@/types';

interface KanbanBoardProps {
  stages: Stage[];
  items: (Deal | Lead)[];
  onMoveItem: (itemId: string, newStageId: string) => void;
  onCardClick?: (item: Deal | Lead) => void;
  onAddClick?: (stageId: string) => void;
}

export function KanbanBoard({ stages, items, onMoveItem, onCardClick, onAddClick }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<Deal | Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getItemsByStage = useCallback(
    (stageId: string) => items.filter((item) => item.stage_id === stageId),
    [items]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current?.item as Deal | Lead;
    if (item) setActiveItem(item);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Pode ser usado para preview visual durante drag
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);

      if (!over) return;

      const activeItem = active.data.current?.item as Deal | Lead;
      if (!activeItem) return;

      // Determina o stage de destino
      let targetStageId: string | null = null;

      if (over.data.current?.type === 'column') {
        targetStageId = over.id as string;
      } else if (over.data.current?.type === 'card') {
        const overItem = over.data.current.item as Deal | Lead;
        targetStageId = overItem.stage_id;
      }

      if (targetStageId && targetStageId !== activeItem.stage_id) {
        onMoveItem(activeItem.id, targetStageId);
      }
    },
    [onMoveItem]
  );

  const sortedStages = [...stages].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 14rem)' }}>
        {sortedStages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={getItemsByStage(stage.id)}
            onCardClick={onCardClick}
            onAddClick={onAddClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="rotate-3 opacity-90">
            <KanbanCard item={activeItem} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
