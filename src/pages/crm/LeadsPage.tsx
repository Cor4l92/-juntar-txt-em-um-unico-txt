import { useState, useEffect, useCallback } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { DetailDrawer } from '@/components/kanban/DetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Loader2, ArrowRightCircle } from 'lucide-react';
import * as leadsService from '@/services/leads';
import * as pipelinesService from '@/services/pipelines';
import { useAuthStore } from '@/stores/authStore';
import type { Lead, Pipeline, Stage } from '@/types';
import toast from 'react-hot-toast';

export function LeadsPage() {
  const { user } = useAuthStore();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createStageId, setCreateStageId] = useState<string | null>(null);
  const [newLeadTitle, setNewLeadTitle] = useState('');
  const [newLeadValue, setNewLeadValue] = useState('');
  const [creating, setCreating] = useState(false);

  const loadPipelines = useCallback(async () => {
    try {
      const data = await pipelinesService.getPipelines('leads');
      setPipelines(data);
      if (data.length > 0 && !activePipelineId) setActivePipelineId(data[0].id);
    } catch { toast.error('Erro ao carregar pipelines'); }
  }, [activePipelineId]);

  const loadLeads = useCallback(async () => {
    if (!activePipelineId) return;
    setIsLoading(true);
    try {
      const [stagesData, leadsData] = await Promise.all([
        pipelinesService.getStages(activePipelineId),
        leadsService.getLeadsByPipeline(activePipelineId),
      ]);
      setStages(stagesData);
      setLeads(leadsData);
    } catch { toast.error('Erro ao carregar leads'); }
    finally { setIsLoading(false); }
  }, [activePipelineId]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);
  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleMoveItem = useCallback(async (leadId: string, newStageId: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage_id: newStageId } : l)));
    try {
      if (user) await leadsService.moveLeadToStage(leadId, newStageId, user.id);
    } catch { loadLeads(); toast.error('Erro ao mover lead'); }
  }, [user, loadLeads]);

  const handleUpdate = useCallback(async (id: string, updates: Partial<Lead>) => {
    await leadsService.updateLead(id, updates);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selectedLead]);

  const handleConvert = async (leadId: string) => {
    if (!user || !confirm('Converter este lead em um Negócio? Será criado um deal automaticamente.')) return;
    try {
      await leadsService.convertLead(leadId, user.id);
      toast.success('Lead convertido em Negócio!');
      loadLeads();
      setDrawerOpen(false);
    } catch { toast.error('Erro ao converter lead'); }
  };

  const handleAddClick = useCallback((stageId: string) => {
    setCreateStageId(stageId);
    setNewLeadTitle('');
    setNewLeadValue('');
    setCreateDialogOpen(true);
  }, []);

  const handleCreateLead = async () => {
    if (!newLeadTitle.trim() || !activePipelineId || !createStageId) return;
    setCreating(true);
    try {
      await leadsService.createLead({
        title: newLeadTitle,
        value: parseFloat(newLeadValue) || 0,
        pipeline_id: activePipelineId,
        stage_id: createStageId,
        created_by: user?.id || null,
        assigned_to: user?.id || null,
      });
      setCreateDialogOpen(false);
      loadLeads();
      toast.success('Lead criado!');
    } catch { toast.error('Erro ao criar lead'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    try {
      await leadsService.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setDrawerOpen(false);
      toast.success('Lead excluído');
    } catch { toast.error('Erro ao excluir lead'); }
  };

  const filteredLeads = searchQuery
    ? leads.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : leads;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <Button onClick={() => handleAddClick(stages[0]?.id || '')}>
          <Plus className="h-4 w-4 mr-2" /> Novo Lead
        </Button>
      </div>

      {pipelines.length > 1 && (
        <Tabs value={activePipelineId || ''} onValueChange={setActivePipelineId}>
          <TabsList>
            {pipelines.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar leads..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-72 shrink-0">
              <Skeleton className="h-12 mb-2 rounded-lg" />
              <Skeleton className="h-32 mb-2 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          stages={stages}
          items={filteredLeads}
          onMoveItem={handleMoveItem}
          onCardClick={(item) => { setSelectedLead(item as Lead); setDrawerOpen(true); }}
          onAddClick={handleAddClick}
        />
      )}

      {/* Detail Drawer with Convert button */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={selectedLead}
        stages={stages}
        entityType="lead"
        onUpdate={handleUpdate}
        onStageChange={handleMoveItem}
        onDelete={handleDelete}
      />

      {/* Convert button appears when drawer is open */}
      {drawerOpen && selectedLead && !selectedLead.converted_at && (
        <div className="fixed bottom-6 right-[660px] z-50">
          <Button size="lg" className="shadow-lg" onClick={() => handleConvert(selectedLead.id)}>
            <ArrowRightCircle className="h-5 w-5 mr-2" /> Converter em Negócio
          </Button>
        </div>
      )}

      {/* Quick Create */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input placeholder="Nome do lead" value={newLeadTitle} onChange={(e) => setNewLeadTitle(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLead()} />
            </div>
            <div className="space-y-2">
              <Label>Valor estimado (R$)</Label>
              <Input type="number" placeholder="0,00" value={newLeadValue} onChange={(e) => setNewLeadValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLead()} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateLead} disabled={creating || !newLeadTitle.trim()}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
