import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Settings, Plus, Pencil, Trash2, Loader2, GripVertical, Users,
  Workflow, ChevronRight,
} from 'lucide-react';
import * as pipelinesService from '@/services/pipelines';
import { supabase } from '@/services/supabase';
import type { Pipeline, Stage, Profile } from '@/types';
import toast from 'react-hot-toast';

// ============================================================================
// Pipelines Settings
// ============================================================================
function PipelinesSettings() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Record<string, Stage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null);

  // Pipeline dialog
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineForm, setPipelineForm] = useState({ name: '', type: 'deals' as Pipeline['type'] });
  const [savingPipeline, setSavingPipeline] = useState(false);

  // Stage dialog
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [stagePipelineId, setStagePipelineId] = useState('');
  const [stageForm, setStageForm] = useState({
    name: '', color: '#3b82f6', semantics: 'in_progress' as Stage['semantics'],
  });
  const [savingStage, setSavingStage] = useState(false);

  const loadPipelines = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pipelinesService.getPipelines();
      setPipelines(data);
    } catch {
      toast.error('Erro ao carregar pipelines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStages = useCallback(async (pipelineId: string) => {
    try {
      const data = await pipelinesService.getStages(pipelineId);
      setStages(prev => ({ ...prev, [pipelineId]: data }));
    } catch {
      toast.error('Erro ao carregar estágios');
    }
  }, []);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);

  const toggleExpand = (id: string) => {
    if (expandedPipeline === id) {
      setExpandedPipeline(null);
    } else {
      setExpandedPipeline(id);
      if (!stages[id]) loadStages(id);
    }
  };

  const openCreatePipeline = () => {
    setEditingPipeline(null);
    setPipelineForm({ name: '', type: 'deals' });
    setPipelineDialogOpen(true);
  };

  const openEditPipeline = (p: Pipeline) => {
    setEditingPipeline(p);
    setPipelineForm({ name: p.name, type: p.type });
    setPipelineDialogOpen(true);
  };

  const handleSavePipeline = async () => {
    if (!pipelineForm.name.trim()) return toast.error('Nome obrigatório');
    setSavingPipeline(true);
    try {
      if (editingPipeline) {
        await pipelinesService.updatePipeline(editingPipeline.id, { name: pipelineForm.name, type: pipelineForm.type });
        toast.success('Pipeline atualizado!');
      } else {
        await pipelinesService.createPipeline({ name: pipelineForm.name, type: pipelineForm.type, sort_order: pipelines.length });
        toast.success('Pipeline criado!');
      }
      setPipelineDialogOpen(false);
      loadPipelines();
    } catch {
      toast.error('Erro ao salvar pipeline');
    } finally {
      setSavingPipeline(false);
    }
  };

  const handleDeletePipeline = async (id: string) => {
    if (!confirm('Excluir este pipeline e todos seus estágios?')) return;
    try {
      await pipelinesService.deletePipeline(id);
      toast.success('Pipeline excluído');
      loadPipelines();
    } catch {
      toast.error('Erro ao excluir pipeline');
    }
  };

  const openCreateStage = (pipelineId: string) => {
    setEditingStage(null);
    setStagePipelineId(pipelineId);
    setStageForm({ name: '', color: '#3b82f6', semantics: 'in_progress' });
    setStageDialogOpen(true);
  };

  const openEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStagePipelineId(stage.pipeline_id);
    setStageForm({ name: stage.name, color: stage.color || '#3b82f6', semantics: stage.semantics });
    setStageDialogOpen(true);
  };

  const handleSaveStage = async () => {
    if (!stageForm.name.trim()) return toast.error('Nome obrigatório');
    setSavingStage(true);
    try {
      if (editingStage) {
        await pipelinesService.updateStage(editingStage.id, {
          name: stageForm.name, color: stageForm.color, semantics: stageForm.semantics,
        });
        toast.success('Estágio atualizado!');
      } else {
        const pStages = stages[stagePipelineId] || [];
        await pipelinesService.createStage({
          pipeline_id: stagePipelineId, name: stageForm.name,
          color: stageForm.color, semantics: stageForm.semantics,
          sort_order: pStages.length,
        });
        toast.success('Estágio criado!');
      }
      setStageDialogOpen(false);
      loadStages(stagePipelineId);
    } catch {
      toast.error('Erro ao salvar estágio');
    } finally {
      setSavingStage(false);
    }
  };

  const handleDeleteStage = async (stage: Stage) => {
    if (!confirm('Excluir este estágio?')) return;
    try {
      await pipelinesService.deleteStage(stage.id);
      toast.success('Estágio excluído');
      loadStages(stage.pipeline_id);
    } catch {
      toast.error('Erro ao excluir estágio');
    }
  };

  const typeLabels: Record<string, string> = {
    leads: 'Leads', deals: 'Negócios', support: 'Suporte', post_sales: 'Pós-Venda',
  };
  const semanticsLabels: Record<string, string> = {
    initial: 'Inicial', in_progress: 'Em Progresso', success: 'Sucesso', failure: 'Falha',
  };
  const semanticsColors: Record<string, string> = {
    initial: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700', failure: 'bg-red-100 text-red-700',
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Gerencie seus pipelines e estágios de vendas, suporte e pós-venda.</p>
        <Button size="sm" onClick={openCreatePipeline}><Plus className="h-4 w-4 mr-1" /> Novo Pipeline</Button>
      </div>

      <div className="space-y-2">
        {pipelines.map(pipeline => (
          <Card key={pipeline.id}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30" onClick={() => toggleExpand(pipeline.id)}>
                <div className="flex items-center gap-3">
                  <ChevronRight className={`h-4 w-4 transition-transform ${expandedPipeline === pipeline.id ? 'rotate-90' : ''}`} />
                  <div>
                    <h3 className="font-medium">{pipeline.name}</h3>
                    <Badge className="mt-0.5" variant="outline">{typeLabels[pipeline.type]}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEditPipeline(pipeline)} className="p-1.5 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDeletePipeline(pipeline.id)} className="p-1.5 rounded hover:bg-muted text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {expandedPipeline === pipeline.id && (
                <div className="border-t px-4 pb-4 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Estágios</span>
                    <Button variant="ghost" size="sm" onClick={() => openCreateStage(pipeline.id)}>
                      <Plus className="h-3 w-3 mr-1" /> Estágio
                    </Button>
                  </div>
                  {!stages[pipeline.id] ? (
                    <Skeleton className="h-8" />
                  ) : stages[pipeline.id].length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Nenhum estágio</p>
                  ) : (
                    <div className="space-y-1">
                      {stages[pipeline.id].map(stage => (
                        <div key={stage.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 group">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color || '#ccc' }} />
                          <span className="text-sm flex-1">{stage.name}</span>
                          <Badge className={`${semanticsColors[stage.semantics]} text-[10px]`}>{semanticsLabels[stage.semantics]}</Badge>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                            <button onClick={() => openEditStage(stage)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => handleDeleteStage(stage)} className="p-1 rounded hover:bg-muted text-red-500"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Dialog */}
      <Dialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingPipeline ? 'Editar Pipeline' : 'Novo Pipeline'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={pipelineForm.name} onChange={e => setPipelineForm({ ...pipelineForm, name: e.target.value })} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={pipelineForm.type} onValueChange={v => setPipelineForm({ ...pipelineForm, type: v as Pipeline['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPipelineDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSavePipeline} disabled={savingPipeline}>
                {savingPipeline && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingPipeline ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stage Dialog */}
      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingStage ? 'Editar Estágio' : 'Novo Estágio'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={stageForm.name} onChange={e => setStageForm({ ...stageForm, name: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={stageForm.color}
                    onChange={e => setStageForm({ ...stageForm, color: e.target.value })}
                    className="h-8 w-12 rounded border cursor-pointer" />
                  <Input value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Semântica</Label>
                <Select value={stageForm.semantics} onValueChange={v => setStageForm({ ...stageForm, semantics: v as Stage['semantics'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(semanticsLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStageDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveStage} disabled={savingStage}>
                {savingStage && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingStage ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Team Management
// ============================================================================
function TeamSettings() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ role: 'agent' as Profile['role'], department: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const openEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({ role: profile.role, department: profile.department || '', is_active: profile.is_active });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProfile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        role: formData.role, department: formData.department || null, is_active: formData.is_active,
      }).eq('id', editingProfile.id);
      if (error) throw error;
      toast.success('Perfil atualizado!');
      setDialogOpen(false);
      loadProfiles();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const roleLabels: Record<string, string> = { admin: 'Administrador', manager: 'Gerente', agent: 'Agente' };
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700', manager: 'bg-blue-100 text-blue-700', agent: 'bg-gray-100 text-gray-700',
  };

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Gerencie os membros da equipe, permissões e departamentos.</p>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium w-32">Cargo</th>
              <th className="text-left p-3 font-medium w-36">Departamento</th>
              <th className="text-left p-3 font-medium w-24">Status</th>
              <th className="text-right p-3 font-medium w-16">Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">{profile.full_name}</span>
                    {profile.job_title && <span className="text-xs text-muted-foreground">· {profile.job_title}</span>}
                  </div>
                </td>
                <td className="p-3"><Badge className={roleColors[profile.role]}>{roleLabels[profile.role]}</Badge></td>
                <td className="p-3 text-muted-foreground">{profile.department || '-'}</td>
                <td className="p-3">
                  <Badge variant="outline" className={profile.is_active ? 'text-green-600' : 'text-gray-400'}>
                    {profile.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(profile)} className="p-1 rounded hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Usuário — {editingProfile?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v as Profile['role'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="Ex: Comercial, Suporte..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData({ ...formData, is_active: v })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Settings Page (Shell)
// ============================================================================
export function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Configurações</h2>
      </div>

      <Tabs defaultValue="pipelines">
        <TabsList>
          <TabsTrigger value="pipelines"><Workflow className="h-4 w-4 mr-1" /> Pipelines</TabsTrigger>
          <TabsTrigger value="team"><Users className="h-4 w-4 mr-1" /> Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines">
          <PipelinesSettings />
        </TabsContent>

        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
