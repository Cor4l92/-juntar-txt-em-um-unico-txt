import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BarChart3, FileSpreadsheet, FileText, Trophy, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import * as reportsService from '@/services/reports';
import * as pipelinesService from '@/services/pipelines';
import type { Pipeline } from '@/types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function ReportsPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Funnel data
  const [funnelData, setFunnelData] = useState<{ name: string; color: string; count: number; value: number; sort_order: number }[]>([]);

  // Team data
  const [teamData, setTeamData] = useState<{ name: string; avatar_url: string | null; deals_won: number; total_value: number }[]>([]);

  // Date range
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const loadPipelines = useCallback(async () => {
    try {
      const data = await pipelinesService.getPipelines('deals');
      setPipelines(data);
      if (data.length > 0) setSelectedPipelineId(data[0].id);
    } catch {
      toast.error('Erro ao carregar pipelines');
    }
  }, []);

  const loadFunnel = useCallback(async () => {
    if (!selectedPipelineId) return;
    setIsLoading(true);
    try {
      const data = await reportsService.getFunnelReport(selectedPipelineId);
      setFunnelData(data);
    } catch {
      toast.error('Erro ao carregar funil');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPipelineId]);

  const loadTeam = useCallback(async () => {
    try {
      const range = dateStart && dateEnd ? { start: dateStart, end: dateEnd } : undefined;
      const data = await reportsService.getTeamPerformance(range);
      setTeamData(data);
    } catch {
      toast.error('Erro ao carregar performance');
    }
  }, [dateStart, dateEnd]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);
  useEffect(() => { loadFunnel(); }, [loadFunnel]);
  useEffect(() => { loadTeam(); }, [loadTeam]);

  // Conversion rates
  const conversionRates = funnelData.map((stage, i) => {
    if (i === 0) return { ...stage, rate: 100 };
    const prev = funnelData[i - 1];
    const rate = prev.count > 0 ? ((stage.count / prev.count) * 100) : 0;
    return { ...stage, rate: Math.round(rate) };
  });

  // Export functions
  const exportFunnelXLSX = () => {
    const rows = funnelData.map(s => ({ Estágio: s.name, Quantidade: s.count, Valor: s.value }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funil');
    XLSX.writeFile(wb, 'funil-vendas.xlsx');
    toast.success('Excel exportado!');
  };

  const exportFunnelPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório - Funil de Vendas', 14, 20);
    doc.setFontSize(10);
    let y = 35;
    doc.text('Estágio', 14, y);
    doc.text('Qtd', 100, y);
    doc.text('Valor', 130, y);
    y += 2;
    doc.line(14, y, 196, y);
    y += 6;
    for (const s of funnelData) {
      doc.text(s.name, 14, y);
      doc.text(String(s.count), 100, y);
      doc.text(formatCurrency(s.value), 130, y);
      y += 7;
    }
    doc.save('funil-vendas.pdf');
    toast.success('PDF exportado!');
  };

  const exportTeamXLSX = () => {
    const rows = teamData.map(t => ({
      Nome: t.name, 'Negócios Ganhos': t.deals_won, 'Valor Total': t.total_value,
      'Ticket Médio': t.deals_won > 0 ? Math.round(t.total_value / t.deals_won) : 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipe');
    XLSX.writeFile(wb, 'performance-equipe.xlsx');
    toast.success('Excel exportado!');
  };

  const exportTeamPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório - Performance da Equipe', 14, 20);
    doc.setFontSize(10);
    let y = 35;
    doc.text('Nome', 14, y);
    doc.text('Ganhos', 90, y);
    doc.text('Valor Total', 120, y);
    doc.text('Ticket Médio', 160, y);
    y += 2;
    doc.line(14, y, 196, y);
    y += 6;
    for (const t of teamData) {
      doc.text(t.name, 14, y);
      doc.text(String(t.deals_won), 90, y);
      doc.text(formatCurrency(t.total_value), 120, y);
      doc.text(formatCurrency(t.deals_won > 0 ? t.total_value / t.deals_won : 0), 160, y);
      y += 7;
    }
    doc.save('performance-equipe.pdf');
    toast.success('PDF exportado!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Relatórios</h2>
      </div>

      <Tabs defaultValue="funnel">
        <TabsList>
          <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="team">Performance da Equipe</TabsTrigger>
        </TabsList>

        {/* FUNNEL TAB */}
        <TabsContent value="funnel">
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Pipeline</Label>
                <Select value={selectedPipelineId} onValueChange={(v) => setSelectedPipelineId(v ?? '')}>
                  <SelectTrigger className="w-52"><SelectValue placeholder="Pipeline" /></SelectTrigger>
                  <SelectContent>
                    {pipelines.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={exportFunnelXLSX}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportFunnelPDF}>
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Funil por Quantidade</CardTitle></CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-64" /> : funnelData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [String(value), 'Negócios']} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {funnelData.map((entry, i) => <Cell key={i} fill={entry.color || '#3b82f6'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Funil por Valor (R$)</CardTitle></CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-64" /> : funnelData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {funnelData.map((entry, i) => <Cell key={i} fill={entry.color || '#10b981'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Conversion rates table */}
            {conversionRates.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" /> Taxas de Conversão
                </CardTitle></CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Estágio</th>
                          <th className="text-right p-3 font-medium">Quantidade</th>
                          <th className="text-right p-3 font-medium">Valor Total</th>
                          <th className="text-right p-3 font-medium">Conversão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conversionRates.map((s, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color || '#3b82f6' }} />
                                {s.name}
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium">{s.count}</td>
                            <td className="p-3 text-right">{formatCurrency(s.value)}</td>
                            <td className="p-3 text-right">
                              <span className={s.rate < 30 ? 'text-red-600' : s.rate < 60 ? 'text-yellow-600' : 'text-green-600'}>
                                {s.rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team">
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Data Início</Label>
                <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Fim</Label>
                <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-40" />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={exportTeamXLSX}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportTeamPDF}>
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" /> Ranking de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor Ganho']} />
                        <Bar dataKey="total_value" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Detalhamento</CardTitle></CardHeader>
                <CardContent>
                  {teamData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados</div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-medium">Vendedor</th>
                            <th className="text-right p-3 font-medium">Ganhos</th>
                            <th className="text-right p-3 font-medium">Valor Total</th>
                            <th className="text-right p-3 font-medium">Ticket Médio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamData.map((member, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">
                                      {member.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  {member.name}
                                </div>
                              </td>
                              <td className="p-3 text-right font-medium">{member.deals_won}</td>
                              <td className="p-3 text-right">{formatCurrency(member.total_value)}</td>
                              <td className="p-3 text-right">
                                {formatCurrency(member.deals_won > 0 ? member.total_value / member.deals_won : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
