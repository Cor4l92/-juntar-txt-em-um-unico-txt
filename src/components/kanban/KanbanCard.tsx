import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Building2, Phone, Mail, Flame, Sun, Snowflake } from 'lucide-react';
import type { Deal, Lead } from '@/types';

interface KanbanCardProps {
  item: Deal | Lead;
  onClick?: () => void;
}

const temperatureIcons = {
  hot: { icon: Flame, color: 'text-red-500', label: 'Quente' },
  warm: { icon: Sun, color: 'text-yellow-500', label: 'Morno' },
  cold: { icon: Snowflake, color: 'text-blue-400', label: 'Frio' },
};

function formatCurrency(value: number | null | undefined) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function KanbanCard({ item, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'card', item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contact = item.contact;
  const company = item.company;
  const assignedUser = item.assigned_user;
  const temp = item.temperature ? temperatureIcons[item.temperature] : null;
  const TempIcon = temp?.icon;
  const initials = assignedUser?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg rotate-2'
      )}
    >
      {/* Título + Temperatura */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium leading-tight line-clamp-2">{item.title}</h4>
        {TempIcon && <TempIcon className={cn('h-4 w-4 shrink-0', temp?.color)} />}
      </div>

      {/* Valor */}
      <p className="text-sm font-semibold text-primary mb-2">
        {formatCurrency(item.value as number)}
      </p>

      {/* Contato */}
      {contact && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Phone className="h-3 w-3" />
          <span className="truncate">
            {contact.first_name} {contact.last_name}
          </span>
        </div>
      )}

      {/* Empresa */}
      {company && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <Building2 className="h-3 w-3" />
          <span className="truncate">{company.name}</span>
        </div>
      )}

      {/* Footer: responsável + contato rápido */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <Avatar className="h-6 w-6">
          <AvatarImage src={assignedUser?.avatar_url || undefined} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-1">
          {contact?.email && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(`mailto:${contact.email}`); }}
              className="p-1 rounded hover:bg-muted"
            >
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {contact?.phone && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(`tel:${contact.phone}`); }}
              className="p-1 rounded hover:bg-muted"
            >
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
