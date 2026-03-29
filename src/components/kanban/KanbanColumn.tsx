import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import type { Stage, Deal, Lead } from '@/types';

interface KanbanColumnProps {
  stage: Stage;
  items: (Deal | Lead)[];
  onCardClick?: (item: Deal | Lead) => void;
  onAddClick?: (stageId: string) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function KanbanColumn({ stage, items, onCardClick, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: 'column', stage } });

  const totalValue = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const itemIds = items.map((item) => item.id);

  return (
    <div
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-lg bg-muted/50 border',
        isOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stage.color || undefined }} />
          <h3 className="text-sm font-semibold truncate flex-1">{stage.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {items.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">{formatCurrency(totalValue)}</p>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 p-2">
        <div ref={setNodeRef} className="space-y-2 min-h-[100px]">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <KanbanCard key={item.id} item={item} onClick={() => onCardClick?.(item)} />
            ))}
          </SortableContext>

          {items.length === 0 && (
            <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
              Arraste itens aqui
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => onAddClick?.(stage.id)}
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
}
