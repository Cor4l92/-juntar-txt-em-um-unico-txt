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
  Search, Plus, Loader2, Mail, Phone, Building2,
  ChevronLeft, ChevronRight, Pencil, Trash2, Users,
} from 'lucide-react';
import * as contactsService from '@/services/contacts';
import { useAuthStore } from '@/stores/authStore';
import type { Contact } from '@/types';
import toast from 'react-hot-toast';

const sourceLabels: Record<string, string> = {
  website: 'Website', referral: 'Indicação', cold_call: 'Cold Call',
  event: 'Evento', social: 'Redes Sociais', other: 'Outro',
};

const typeLabels: Record<string, string> = {
  client: 'Cliente', supplier: 'Fornecedor', partner: 'Parceiro', other: 'Outro',
};

export function ContactsPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    first_name: string; last_name: string; email: string; phone: string; mobile: string;
    job_title: string; source: string; type: 'client' | 'supplier' | 'partner' | 'other';
  }>({
    first_name: '', last_name: '', email: '', phone: '', mobile: '',
    job_title: '', source: '', type: 'client',
  });

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await contactsService.getContacts(
        { page, per_page: 20, sort_by: 'created_at', sort_direction: 'desc' },
        searchQuery ? { search: searchQuery } : undefined
      );
      setContacts(result.data);
      setTotalPages(result.total_pages);
      setTotalCount(result.count);
    } catch { toast.error('Erro ao carregar contatos'); }
    finally { setIsLoading(false); }
  }, [page, searchQuery]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Debounced search
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const openCreateDialog = () => {
    setEditingContact(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', mobile: '', job_title: '', source: '', type: 'client' });
    setDialogOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      job_title: contact.job_title || '',
      source: contact.source || '',
      type: contact.type || 'client',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.first_name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      if (editingContact) {
        await contactsService.updateContact(editingContact.id, formData);
        toast.success('Contato atualizado!');
      } else {
        await contactsService.createContact({ ...formData, created_by: user?.id || null, assigned_to: user?.id || null });
        toast.success('Contato criado!');
      }
      setDialogOpen(false);
      loadContacts();
    } catch { toast.error('Erro ao salvar contato'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return;
    try {
      await contactsService.deleteContact(id);
      toast.success('Contato excluído');
      loadContacts();
    } catch { toast.error('Erro ao excluir'); }
  };

  const getInitials = (contact: Contact) =>
    `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contatos</h2>
          <p className="text-sm text-muted-foreground">{totalCount} contato(s)</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" /> Novo Contato
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, email ou telefone..." className="pl-9"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum contato encontrado</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" /> Criar primeiro contato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Contato</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Telefone</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Empresa</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Tipo</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Origem</th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(contact)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        {contact.job_title && <p className="text-xs text-muted-foreground">{contact.job_title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3.5 w-3.5" /> {contact.email}
                      </a>
                    )}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {contact.phone}
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    {contact.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {contact.company.name}
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <Badge variant="secondary">{typeLabels[contact.type || 'client']}</Badge>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">
                    {sourceLabels[contact.source || ''] || contact.source}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(contact)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(contact.id)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome</Label>
                <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as typeof formData.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={formData.source || ''} onValueChange={(v) => setFormData({ ...formData, source: v ?? '' })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingContact ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
