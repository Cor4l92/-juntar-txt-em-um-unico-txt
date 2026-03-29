import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight, Pencil, Trash2,
  AlertCircle, LifeBuoy, Hash,
} from 'lucide-react';
import { format } from 'date-fns';
import * as ticketsService from '@/services/tickets';
import * as pipelinesService from '@/services/pipelines';
import { useAuthStore } from '@/stores/authStore';
import type { Ticket, Pipeline, Stage } from '@/types';
import toast from 'react-hot-toast';

const priorityLabels: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica',
};
const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
};

function getSlaStatus(deadline: string | null): { label: string; color: string } {
  if (!deadline) return { label: '-', color: '' };
  const now = new Date();
  const sla = new Date(deadline);
  const hoursLeft = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { label: 'Vencido', color: 'text-red-600 font-medium' };
  if (hoursLeft < 4) return { label: `${Math.ceil(hoursLeft)}h restantes`, color: 'text-yellow-600' };
  return { label: format(sla, 'dd/MM HH:mm'), color: 'text-green-600' };
}

const emptyForm = {
  title: '', description: '', priority: 'medium' as Ticket['priority'], category: '',
};

export function TicketsPage() {
  const { user } = useAuthStore();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterPriority, setFilterPriority] = useState('');

  // List view pagination
  const [listTickets, setListTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const loadPipelines = useCallback(async () => {
    try {
      const data = await pipelinesService.getPipelines('support');
      setPipelines(data);
      if (data.length > 0 && !activePipelineId) setActivePipelineId(data[0].id);
    } catch {
      toast.error('Erro ao carregar pipelines');
    }
  }, [activePipelineId]);

  const loadKanbanTickets = useCallback(async () => {
    if (!activePipelineId) return;
    setIsLoading(true);
    try {
      const [stagesData, ticketsData] = await Promise.all([
        pipelinesService.getStages(activePipelineId),
        ticketsService.getTicketsByPipeline(activePipelineId),
      ]);
      setStages(stagesData);
      setTickets(ticketsData);
    } catch {
      toast.error('Erro ao carregar tickets');
    } finally {
      setIsLoading(false);
    }
  }, [activePipelineId]);

  const loadListTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterPriority) filters.priority = filterPriority;
      if (activePipelineId) filters.pipeline_id = activePipelineId;
      const result = await ticketsService.getTickets({ page, per_page: 25 }, filters);
      setListTickets(result.data);
      setTotalPages(result.total_pages);
      setTotalCount(result.count);
    } catch {
      toast.error('Erro ao carregar tickets');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filterPriority, activePipelineId]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);
  useEffect(() => {
    if (viewMode === 'kanban') loadKanbanTickets();
    else loadListTickets();
  }, [viewMode, loadKanbanTickets, loadListTickets]);

  const handleMoveItem = useCallback(async (ticketId: string, newStageId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, stage_id: newStageId } : t));
    try {
      if (user) await ticketsService.moveTicketToStage(ticketId, newStageId, user.id);
    } catch {
      loadKanbanTickets();
      toast.error('Erro ao mover ticket');
    }
  }, [user, loadKanbanTickets]);

  const openCreate = () => {
    setEditingTicket(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title, description: ticket.description || '',
      priority: ticket.priority, category: ticket.category || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return toast.error('Título obrigatório');
    setSaving(true);
    try {
      const payload: Partial<Ticket> = {
        title: formData.title, description: formData.description || null,
        priority: formData.priority, category: formData.category || null,
      };
      if (editingTicket) {
        await ticketsService.updateTicket(editingTicket.id, payload);
        toast.success('Ticket atualizado!');
      } else {
        payload.pipeline_id = activePipelineId;
        payload.stage_id = stages.length > 0 ? stages[0].id : null;
        payload.assigned_to = user?.id || null;
        payload.created_by = user?.id || null;
        await ticketsService.createTicket(payload);
        toast.success('Ticket criado!');
      }
      setDialogOpen(false);
      if (viewMode === 'kanban') loadKanbanTickets(); else loadListTickets();
    } catch {
      toast.error('Erro ao salvar ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este ticket?')) return;
    try {
      await ticketsService.deleteTicket(id);
      toast.success('Ticket excluído');
      if (viewMode === 'kanban') loadKanbanTickets(); else loadListTickets();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  // Map tickets for KanbanBoard (expects Deal|Lead shape)
  const kanbanItems = tickets.map(t => ({
    ...t, value: null, temperature: null,
    contact: t.contact ? { ...t.contact, type: 'client' as const } : undefined,
    company: t.company || undefined,
    assigned_user: t.assigned_user || undefined,
  }));

  const filteredKanbanItems = searchQuery
    ? kanbanItems.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : kanbanItems;

  const displayListTickets = viewMode === 'list' ? listTickets : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Suporte</h2>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Novo Ticket</Button>
      </div>

      {/* Pipeline tabs */}
      {pipelines.length > 1 && (
        <Tabs value={activePipelineId || ''} onValueChange={setActivePipelineId}>
          <TabsList>
            {pipelines.map(p => <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <button onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
            Kanban
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
            Lista
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tickets..." className="pl-9 w-64" value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>

        <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v === '__all__' ? '' : (v ?? '')); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas</SelectItem>
            {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        isLoading ? (
          <div className="flex gap-4">{[1,2,3,4].map(i => (
            <div key={i} className="w-72 shrink-0"><Skeleton className="h-12 mb-2 rounded-lg" /><Skeleton className="h-32 rounded-lg" /></div>
          ))}</div>
        ) : (
          <KanbanBoard
            stages={stages}
            items={filteredKanbanItems as any}
            onMoveItem={handleMoveItem}
            onCardClick={(item) => {
              const ticket = tickets.find(t => t.id === item.id);
              if (ticket) openEdit(ticket);
            }}
            onAddClick={() => openCreate()}
          />
        )
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        isLoading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : displayListTickets.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum ticket encontrado</CardContent></Card>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium w-20">#</th>
                    <th className="text-left p-3 font-medium">Título</th>
                    <th className="text-left p-3 font-medium w-28">Prioridade</th>
                    <th className="text-left p-3 font-medium w-40">Contato</th>
                    <th className="text-left p-3 font-medium w-36">Responsável</th>
                    <th className="text-left p-3 font-medium w-32">SLA</th>
                    <th className="text-left p-3 font-medium w-28">Criado em</th>
                    <th className="text-right p-3 font-medium w-20">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {displayListTickets.map(ticket => {
                    const sla = getSlaStatus(ticket.sla_deadline);
                    return (
                      <tr key={ticket.id} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Hash className="h-3 w-3" />{ticket.ticket_number}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{ticket.title}</td>
                        <td className="p-3"><Badge className={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge></td>
                        <td className="p-3 text-xs">
                          {ticket.contact && `${ticket.contact.first_name} ${ticket.contact.last_name || ''}`}
                        </td>
                        <td className="p-3">
                          {ticket.assigned_user && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {ticket.assigned_user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs truncate">{ticket.assigned_user.full_name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center gap-1 text-xs ${sla.color}`}>
                            {ticket.sla_deadline && <AlertCircle className="h-3 w-3" />}
                            {sla.label}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {ticket.created_at && format(new Date(ticket.created_at), 'dd/MM/yy')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(ticket)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDelete(ticket.id)} className="p-1 rounded hover:bg-muted text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">{totalCount} ticket(s)</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTicket ? 'Editar Ticket' : 'Novo Ticket'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-20 resize-y"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Ticket['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Bug, Dúvida..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingTicket ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
