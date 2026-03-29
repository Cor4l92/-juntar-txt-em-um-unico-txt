import { useState, useEffect, useCallback } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { DetailDrawer } from '@/components/kanban/DetailDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Loader2 } from 'lucide-react';
import * as dealsService from '@/services/deals';
import * as pipelinesService from '@/services/pipelines';
import { useAuthStore } from '@/stores/authStore';
import type { Deal, Pipeline, Stage } from '@/types';
import toast from 'react-hot-toast';

export function DealsPage() {
  const { user } = useAuthStore();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Drawer
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Quick Create Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createStageId, setCreateStageId] = useState<string | null>(null);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [creating, setCreating] = useState(false);

  const loadPipelines = useCallback(async () => {
    try {
      const data = await pipelinesService.getPipelines('deals');
      setPipelines(data);
      if (data.length > 0 && !activePipelineId) {
        setActivePipelineId(data[0].id);
      }
    } catch (err) {
      toast.error('Erro ao carregar pipelines');
      console.error(err);
    }
  }, [activePipelineId]);

  const loadDeals = useCallback(async () => {
    if (!activePipelineId) return;
    setIsLoading(true);
    try {
      const [stagesData, dealsData] = await Promise.all([
        pipelinesService.getStages(activePipelineId),
        dealsService.getDealsByPipeline(activePipelineId),
      ]);
      setStages(stagesData);
      setDeals(dealsData);
    } catch (err) {
      toast.error('Erro ao carregar negócios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activePipelineId]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);
  useEffect(() => { loadDeals(); }, [loadDeals]);

  const handleMoveItem = useCallback(async (dealId: string, newStageId: string) => {
    // Optimistic update
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d)));
    try {
      if (user) await dealsService.moveDealToStage(dealId, newStageId, user.id);
    } catch {
      loadDeals(); // Revert on error
      toast.error('Erro ao mover negócio');
    }
  }, [user, loadDeals]);

  const handleCardClick = useCallback((item: Deal) => {
    setSelectedDeal(item);
    setDrawerOpen(true);
  }, []);

  const handleUpdate = useCallback(async (id: string, updates: Partial<Deal>) => {
    await dealsService.updateDeal(id, updates);
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    if (selectedDeal?.id === id) setSelectedDeal((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selectedDeal]);

  const handleAddClick = useCallback((stageId: string) => {
    setCreateStageId(stageId);
    setNewDealTitle('');
    setNewDealValue('');
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDeal = async () => {
    if (!newDealTitle.trim() || !activePipelineId || !createStageId) return;
    setCreating(true);
    try {
      await dealsService.createDeal({
        title: newDealTitle,
        value: parseFloat(newDealValue) || 0,
        pipeline_id: activePipelineId,
        stage_id: createStageId,
        created_by: user?.id || null,
        assigned_to: user?.id || null,
      });
      setCreateDialogOpen(false);
      loadDeals();
      toast.success('Negócio criado!');
    } catch {
      toast.error('Erro ao criar negócio');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este negócio?')) return;
    try {
      await dealsService.deleteDeal(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
      setDrawerOpen(false);
      toast.success('Negócio excluído');
    } catch {
      toast.error('Erro ao excluir negócio');
    }
  };

  const filteredDeals = searchQuery
    ? deals.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : deals;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Negócios</h2>
        <Button onClick={() => handleAddClick(stages[0]?.id || '')}>
          <Plus className="h-4 w-4 mr-2" /> Novo Negócio
        </Button>
      </div>

      {/* Pipeline Tabs */}
      {pipelines.length > 1 && (
        <Tabs value={activePipelineId || ''} onValueChange={setActivePipelineId}>
          <TabsList>
            {pipelines.map((p) => (
              <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar negócios..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Kanban */}
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
          items={filteredDeals}
          onMoveItem={handleMoveItem}
          onCardClick={(item) => handleCardClick(item as Deal)}
          onAddClick={handleAddClick}
        />
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={selectedDeal}
        stages={stages}
        entityType="deal"
        onUpdate={handleUpdate}
        onStageChange={handleMoveItem}
        onDelete={handleDelete}
      />

      {/* Quick Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Negócio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Nome do negócio"
                value={newDealTitle}
                onChange={(e) => setNewDealTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={newDealValue}
                onChange={(e) => setNewDealValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeal()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateDeal} disabled={creating || !newDealTitle.trim()}>
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
