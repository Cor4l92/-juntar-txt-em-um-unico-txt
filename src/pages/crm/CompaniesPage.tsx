import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, Loader2, Globe, Phone, Building2,
  ChevronLeft, ChevronRight, Pencil, Trash2,
} from 'lucide-react';
import * as companiesService from '@/services/companies';
import { useAuthStore } from '@/stores/authStore';
import type { Company } from '@/types';
import toast from 'react-hot-toast';

const typeLabels: Record<string, string> = {
  client: 'Cliente', supplier: 'Fornecedor', partner: 'Parceiro', other: 'Outro',
};

const employeeLabels: Record<string, string> = {
  less_50: 'Até 50', '50_250': '50-250', '250_1000': '250-1000', more_1000: '1000+',
};

export function CompaniesPage() {
  const { user } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    name: string; trade_name: string; cnpj: string; industry: string; website: string;
    phone: string; email: string; employee_count: string; type: 'client' | 'supplier' | 'partner' | 'other';
  }>({
    name: '', trade_name: '', cnpj: '', industry: '', website: '',
    phone: '', email: '', employee_count: '', type: 'client',
  });

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await companiesService.getCompanies(
        { page, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' },
        searchQuery ? { search: searchQuery } : undefined
      );
      setCompanies(result.data);
      setTotalPages(result.total_pages);
      setTotalCount(result.count);
    } catch { toast.error('Erro ao carregar empresas'); }
    finally { setIsLoading(false); }
  }, [page, searchQuery]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const openCreateDialog = () => {
    setEditingCompany(null);
    setFormData({ name: '', trade_name: '', cnpj: '', industry: '', website: '', phone: '', email: '', employee_count: '', type: 'client' });
    setDialogOpen(true);
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '', trade_name: company.trade_name || '',
      cnpj: company.cnpj || '', industry: company.industry || '',
      website: company.website || '', phone: company.phone || '',
      email: company.email || '', employee_count: company.employee_count || '',
      type: (company.type || 'client') as 'client' | 'supplier' | 'partner' | 'other',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Razão social é obrigatória'); return; }
    setSaving(true);
    try {
      if (editingCompany) {
        await companiesService.updateCompany(editingCompany.id, formData);
        toast.success('Empresa atualizada!');
      } else {
        await companiesService.createCompany({ ...formData, created_by: user?.id || null, assigned_to: user?.id || null });
        toast.success('Empresa criada!');
      }
      setDialogOpen(false);
      loadCompanies();
    } catch { toast.error('Erro ao salvar empresa'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    try {
      await companiesService.deleteCompany(id);
      toast.success('Empresa excluída');
      loadCompanies();
    } catch { toast.error('Erro ao excluir'); }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Empresas</h2>
          <p className="text-sm text-muted-foreground">{totalCount} empresa(s)</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" /> Nova Empresa
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou CNPJ..." className="pl-9"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" /> Criar primeira empresa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Empresa</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">CNPJ</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Segmento</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Porte</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Faturamento</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Tipo</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {company.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.trade_name && <p className="text-xs text-muted-foreground">{company.trade_name}</p>}
                        <div className="flex items-center gap-3 mt-0.5">
                          {company.website && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" /> {company.website}
                            </span>
                          )}
                          {company.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {company.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{company.cnpj || '-'}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{company.industry || '-'}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">
                    {employeeLabels[company.employee_count || ''] || '-'}
                  </td>
                  <td className="p-3 hidden lg:table-cell font-medium">
                    {formatCurrency(company.annual_revenue as number)}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <Badge variant="secondary">{typeLabels[company.type || 'client']}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(company)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(company.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input value={formData.trade_name} onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="Ex: Tecnologia" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as typeof formData.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Porte</Label>
                <Select value={formData.employee_count || ''} onValueChange={(v) => setFormData({ ...formData, employee_count: v ?? '' })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(employeeLabels).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingCompany ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
