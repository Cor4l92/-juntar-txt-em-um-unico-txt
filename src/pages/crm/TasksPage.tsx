import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight, Pencil, Trash2,
  CheckSquare, Square, Clock, AlertTriangle,
} from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as tasksService from '@/services/tasks';
import { useAuthStore } from '@/stores/authStore';
import type { Task, ChecklistItem } from '@/types';
import toast from 'react-hot-toast';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const statusLabels: Record<string, string> = {
  pending: 'Pendente', in_progress: 'Em Andamento', waiting_review: 'Aguardando Revisão',
  completed: 'Concluída', deferred: 'Adiada',
};
const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700',
  waiting_review: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700',
  deferred: 'bg-purple-100 text-purple-700',
};
const priorityLabels: Record<string, string> = {
  low: 'Baixa', normal: 'Normal', high: 'Alta', critical: 'Crítica',
};
const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
};
const calendarEventColors: Record<string, string> = {
  low: '#9ca3af', normal: '#3b82f6', high: '#f97316', critical: '#ef4444',
};

const emptyForm = {
  title: '', description: '', status: 'pending' as Task['status'],
  priority: 'normal' as Task['priority'], due_date: '', start_date: '', estimated_hours: '',
};

export function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      const result = await tasksService.getTasks({ page, per_page: 25 }, filters);
      setTasks(result.data);
      setTotalPages(result.total_pages);
      setTotalCount(result.count);
    } catch {
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filterStatus, filterPriority]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const openCreate = () => {
    setEditingTask(null);
    setFormData(emptyForm);
    setChecklist([]);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      start_date: task.start_date ? task.start_date.split('T')[0] : '',
      estimated_hours: task.estimated_hours?.toString() || '',
    });
    setChecklist(task.checklist || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return toast.error('Título obrigatório');
    setSaving(true);
    try {
      const payload: Partial<Task> = {
        title: formData.title, description: formData.description || null,
        status: formData.status, priority: formData.priority,
        due_date: formData.due_date || null, start_date: formData.start_date || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        checklist: checklist.length > 0 ? checklist : null,
        assigned_to: user?.id || null,
      };
      if (editingTask) {
        await tasksService.updateTask(editingTask.id, payload);
        toast.success('Tarefa atualizada!');
      } else {
        payload.created_by = user?.id || null;
        await tasksService.createTask(payload);
        toast.success('Tarefa criada!');
      }
      setDialogOpen(false);
      loadTasks();
    } catch {
      toast.error('Erro ao salvar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta tarefa?')) return;
    try {
      await tasksService.deleteTask(id);
      toast.success('Tarefa excluída');
      loadTasks();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await tasksService.updateTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as Task['status'] } : t));
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist(prev => [...prev, { id: crypto.randomUUID(), text: newCheckItem, done: false }]);
    setNewCheckItem('');
  };

  const toggleCheckItem = (id: string) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const removeCheckItem = (id: string) => {
    setChecklist(prev => prev.filter(i => i.id !== id));
  };

  // Calendar events
  const calendarEvents = useMemo(() =>
    tasks.filter(t => t.due_date).map(t => ({
      id: t.id, title: t.title,
      start: new Date(t.due_date!), end: new Date(t.due_date!),
      resource: t,
    })), [tasks]);

  const eventStyleGetter = (event: { resource: Task }) => ({
    style: {
      backgroundColor: calendarEventColors[event.resource.priority] || '#3b82f6',
      borderRadius: '4px', border: 'none', fontSize: '12px',
    },
  });

  // Kanban columns
  const kanbanStatuses = ['pending', 'in_progress', 'waiting_review', 'completed', 'deferred'] as const;

  const isOverdue = (t: Task) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tarefas</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Nova Tarefa</Button>
      </div>

      <Tabs defaultValue="list">
        <div className="flex items-center gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tarefas..." className="pl-9 w-64" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
          </div>

          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v === '__all__' ? '' : (v ?? '')); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os Status</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v === '__all__' ? '' : (v ?? '')); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* LIST VIEW */}
        <TabsContent value="list">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : tasks.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma tarefa encontrada</CardContent></Card>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Título</th>
                      <th className="text-left p-3 font-medium w-32">Status</th>
                      <th className="text-left p-3 font-medium w-28">Prioridade</th>
                      <th className="text-left p-3 font-medium w-36">Responsável</th>
                      <th className="text-left p-3 font-medium w-32">Vencimento</th>
                      <th className="text-right p-3 font-medium w-20">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}>
                              {task.status === 'completed'
                                ? <CheckSquare className="h-4 w-4 text-green-600" />
                                : <Square className="h-4 w-4 text-muted-foreground" />}
                            </button>
                            <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                            {isOverdue(task) && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                          </div>
                        </td>
                        <td className="p-3"><Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge></td>
                        <td className="p-3"><Badge className={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge></td>
                        <td className="p-3">
                          {task.assigned_user && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {task.assigned_user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs truncate">{task.assigned_user.full_name}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                                {format(new Date(task.due_date), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(task)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-muted text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">{totalCount} tarefa(s)</span>
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
          )}
        </TabsContent>

        {/* KANBAN VIEW */}
        <TabsContent value="kanban">
          {isLoading ? (
            <div className="flex gap-4">{[1,2,3,4,5].map(i => (
              <div key={i} className="w-64 shrink-0"><Skeleton className="h-12 mb-2 rounded-lg" /><Skeleton className="h-32 rounded-lg" /></div>
            ))}</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 16rem)' }}>
              {kanbanStatuses.map(status => {
                const statusTasks = tasks.filter(t => t.status === status);
                return (
                  <div key={status} className="w-64 shrink-0">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <h3 className="text-sm font-semibold">{statusLabels[status]}</h3>
                      <Badge variant="outline" className="text-xs">{statusTasks.length}</Badge>
                    </div>
                    <div className="space-y-2 min-h-32 p-1 rounded-lg bg-muted/30">
                      {statusTasks.map(task => (
                        <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(task)}>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium line-clamp-2">{task.title}</span>
                              <Badge className={`${priorityColors[task.priority]} text-[10px] shrink-0`}>
                                {priorityLabels[task.priority]}
                              </Badge>
                            </div>
                            {task.due_date && (
                              <div className={`flex items-center gap-1 text-xs ${isOverdue(task) ? 'text-red-600' : 'text-muted-foreground'}`}>
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.due_date), 'dd/MM')}
                              </div>
                            )}
                            {task.assigned_user && (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[9px]">
                                    {task.assigned_user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate">{task.assigned_user.full_name}</span>
                              </div>
                            )}
                            {task.checklist && task.checklist.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {task.checklist.filter(c => c.done).length}/{task.checklist.length} itens
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4">
              <div style={{ height: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(event) => openEdit(event.resource)}
                  messages={{
                    today: 'Hoje', previous: 'Anterior', next: 'Próximo',
                    month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda',
                    noEventsInRange: 'Sem tarefas neste período',
                  }}
                  culture="pt-BR"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
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
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Task['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Task['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data Vencimento</Label>
                <Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horas Estimadas</Label>
              <Input type="number" step="0.5" value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <Label>Checklist</Label>
              <div className="space-y-1">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button onClick={() => toggleCheckItem(item.id)}>
                      {item.done ? <CheckSquare className="h-4 w-4 text-green-600" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                    <button onClick={() => removeCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Novo item..." value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCheckItem()} className="text-sm" />
                <Button variant="outline" size="sm" onClick={addCheckItem}>+</Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingTask ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
