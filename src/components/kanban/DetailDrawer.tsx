import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Building2, User, Calendar, DollarSign, Phone, Mail,
  Plus, Pencil, Check, X, Trash2, MessageSquare, Clock,
  Flame, Sun, Snowflake,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as activitiesService from '@/services/activities';
import type { Deal, Lead, Stage, Activity } from '@/types';
import toast from 'react-hot-toast';

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: (Deal | Lead) | null;
  stages: Stage[];
  entityType: 'deal' | 'lead';
  onUpdate: (id: string, updates: Partial<Deal | Lead>) => Promise<void>;
  onStageChange: (itemId: string, stageId: string) => void;
  onDelete?: (id: string) => void;
}

function formatCurrency(value: number | null | undefined) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const temperatureConfig = {
  hot: { icon: Flame, color: 'bg-red-100 text-red-700', label: 'Quente' },
  warm: { icon: Sun, color: 'bg-yellow-100 text-yellow-700', label: 'Morno' },
  cold: { icon: Snowflake, color: 'bg-blue-100 text-blue-700', label: 'Frio' },
};

export function DetailDrawer({
  open, onOpenChange, item, stages, entityType, onUpdate, onStageChange, onDelete,
}: DetailDrawerProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');

  const loadActivities = useCallback(async () => {
    if (!item) return;
    try {
      const data = await activitiesService.getActivities(entityType, item.id);
      setActivities(data);
    } catch {
      // silencioso
    }
  }, [item, entityType]);

  useEffect(() => {
    if (open && item) loadActivities();
  }, [open, item, loadActivities]);

  if (!item) return null;

  const sortedStages = [...stages].sort((a, b) => a.sort_order - b.sort_order);
  const currentStageIndex = sortedStages.findIndex((s) => s.id === item.stage_id);
  const contact = item.contact;
  const company = item.company;
  const temp = item.temperature ? temperatureConfig[item.temperature] : null;

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const saveEdit = async (field: string) => {
    try {
      await onUpdate(item.id, { [field]: field === 'value' ? parseFloat(editValue) : editValue });
      setEditingField(null);
      toast.success('Campo atualizado');
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await activitiesService.createActivity({
        entity_type: entityType,
        entity_id: item.id,
        type: 'note',
        title: 'Nota',
        description: newNote,
      });
      setNewNote('');
      loadActivities();
      toast.success('Nota adicionada');
    } catch {
      toast.error('Erro ao adicionar nota');
    }
  };

  const renderEditableField = (field: string, label: string, value: string | null | undefined, icon?: React.ReactNode) => (
    <div className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      {editingField === field ? (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 w-40 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(field); if (e.key === 'Escape') cancelEdit(); }}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(field)}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          className="flex items-center gap-1 text-sm font-medium hover:text-primary"
          onClick={() => startEdit(field, value || '')}
        >
          {value || <span className="text-muted-foreground italic">Não definido</span>}
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[640px] sm:max-w-[640px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">{item.title}</SheetTitle>
            <div className="flex items-center gap-2">
              {temp && (
                <Badge className={cn('gap-1', temp.color)}>
                  <temp.icon className="h-3 w-3" />
                  {temp.label}
                </Badge>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Stage Bar */}
        <div className="px-6 py-3 border-b bg-muted/30">
          <div className="flex gap-1">
            {sortedStages.map((stage, i) => (
              <button
                key={stage.id}
                onClick={() => onStageChange(item.id, stage.id)}
                className={cn(
                  'flex-1 h-8 rounded text-xs font-medium transition-all flex items-center justify-center',
                  i <= currentStageIndex
                    ? 'text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
                style={i <= currentStageIndex ? { backgroundColor: stage.color || undefined } : undefined}
                title={stage.name}
              >
                <span className="truncate px-1">{stage.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="principal" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-3 w-fit">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="principal" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                {/* Valor */}
                <div className="rounded-lg border p-4 bg-card">
                  <Label className="text-xs text-muted-foreground mb-1 block">Valor</Label>
                  {editingField === 'value' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        type="number"
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit('value'); if (e.key === 'Escape') cancelEdit(); }}
                      />
                      <Button size="sm" onClick={() => saveEdit('value')}><Check className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <button
                      className="text-2xl font-bold text-primary hover:underline"
                      onClick={() => startEdit('value', String(item.value || 0))}
                    >
                      {formatCurrency(item.value as number)}
                    </button>
                  )}
                </div>

                {/* Contato */}
                {contact && (
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" /> Contato
                    </h4>
                    <p className="text-sm font-medium">{contact.first_name} {contact.last_name}</p>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-primary mt-1">
                        <Mail className="h-3 w-3" /> {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" /> {contact.phone}
                      </a>
                    )}
                  </div>
                )}

                {/* Empresa */}
                {company && (
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Empresa
                    </h4>
                    <p className="text-sm font-medium">{company.name}</p>
                    {company.trade_name && <p className="text-xs text-muted-foreground">{company.trade_name}</p>}
                  </div>
                )}

                <Separator />

                {/* Campos editáveis */}
                <div className="space-y-1">
                  {renderEditableField('title', 'Título', item.title)}
                  {renderEditableField('notes', 'Observações', item.notes, <MessageSquare className="h-3.5 w-3.5" />)}
                  {'expected_close_date' in item && renderEditableField('expected_close_date', 'Previsão Fechamento', (item as Deal).expected_close_date, <Calendar className="h-3.5 w-3.5" />)}
                  {renderEditableField('source', 'Origem', item.source, <DollarSign className="h-3.5 w-3.5" />)}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                {/* Adicionar nota */}
                <div className="mb-4">
                  <Textarea
                    placeholder="Adicionar nota..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Nota
                  </Button>
                </div>

                <Separator className="mb-4" />

                {/* Activities list */}
                <div className="space-y-3">
                  {activities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade registrada</p>
                  )}
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={cn(
                        'rounded-lg border p-3',
                        activity.type === 'stage_change' && 'bg-blue-50/50 border-blue-200',
                        !activity.is_done && activity.scheduled_at && 'bg-yellow-50/50 border-yellow-200'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">{activity.type}</Badge>
                          <span className="text-sm font-medium">{activity.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      )}
                      {activity.creator && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.creator.avatar_url || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {activity.creator.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{activity.creator.full_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
