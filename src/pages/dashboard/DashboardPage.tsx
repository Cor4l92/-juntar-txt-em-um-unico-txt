import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, LifeBuoy, CheckSquare, DollarSign,
  Trophy, Clock, AlertTriangle, Phone, Mail, Calendar,
  MessageSquare, ArrowRight, Zap, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import * as reportsService from '@/services/reports';
import * as tasksService from '@/services/tasks';
import * as activitiesService from '@/services/activities';
import * as pipelinesService from '@/services/pipelines';
import { useAuthStore } from '@/stores/authStore';
import type { Task, Activity } from '@/types';
import toast from 'react-hot-toast';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const activityIcons: Record<string, { icon: typeof Phone; color: string }> = {
  call: { icon: Phone, color: 'text-green-600' },
  email: { icon: Mail, color: 'text-blue-600' },
  meeting: { icon: Users, color: 'text-purple-600' },
  note: { icon: MessageSquare, color: 'text-gray-600' },
  task: { icon: CheckSquare, color: 'text-amber-600' },
  stage_change: { icon: ArrowRight, color: 'text-orange-600' },
  field_change: { icon: TrendingUp, color: 'text-slate-600' },
  system: { icon: Zap, color: 'text-slate-500' },
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<{
    openDeals: { count: number; value: number };
    wonDealsMonth: { count: number; value: number };
    lostDeals: { count: number };
    openTickets: { count: number };
  } | null>(null);
  const [funnelData, setFunnelData] = useState<{ name: string; color: string; count: number; value: number }[]>([]);
  const [teamData, setTeamData] = useState<{ name: string; deals_won: number; total_value: number }[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpisData, pipelinesData, tasksData, activitiesData, teamPerf] = await Promise.all([
        reportsService.getDashboardKPIs(),
        pipelinesService.getPipelines('deals'),
        tasksService.getOverdueTasks(user?.id),
        activitiesService.getUpcomingActivities(user?.id),
        reportsService.getTeamPerformance(),
      ]);
      setKpis(kpisData);
      setOverdueTasks(tasksData.slice(0, 5));
      setUpcomingActivities(activitiesData.slice(0, 8));
      setTeamData(teamPerf.slice(0, 5));

      if (pipelinesData.length > 0) {
        const funnel = await reportsService.getFunnelReport(pipelinesData[0].id);
        setFunnelData(funnel);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24 mb-1" /><Skeleton className="h-4 w-32" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardContent className="pt-6"><Skeleton className="h-64" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-64" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Negócios Abertos', icon: TrendingUp, color: 'text-blue-500',
      value: kpis?.openDeals.count || 0, subtitle: formatCurrency(kpis?.openDeals.value || 0),
    },
    {
      title: 'Ganhos no Mês', icon: DollarSign, color: 'text-green-500',
      value: kpis?.wonDealsMonth.count || 0, subtitle: formatCurrency(kpis?.wonDealsMonth.value || 0),
    },
    {
      title: 'Tickets Abertos', icon: LifeBuoy, color: 'text-orange-500',
      value: kpis?.openTickets.count || 0, subtitle: 'aguardando resolução',
    },
    {
      title: 'Tarefas Atrasadas', icon: AlertTriangle, color: 'text-red-500',
      value: overdueTasks.length, subtitle: 'precisam de atenção',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados de funil</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${value} negócio(s) — ${formatCurrency(props?.payload?.value ?? 0)}`, ''
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Performance da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamData.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">Sem dados de equipe</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={teamData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor Ganho']} />
                  <Bar dataKey="total_value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhuma atividade agendada</p>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map(activity => {
                  const cfg = activityIcons[activity.type] || activityIcons.system;
                  const Icon = cfg.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 ${cfg.color}`}><Icon className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        {activity.scheduled_at && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            {' · '}
                            {formatDistanceToNow(new Date(activity.scheduled_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Tarefas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhuma tarefa atrasada</p>
            ) : (
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3">
                    <CheckSquare className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`${priorityColors[task.priority]} text-[10px]`}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-red-600">
                            <Clock className="h-3 w-3 inline mr-0.5" />
                            {format(new Date(task.due_date), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.assigned_user && (
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-[10px]">
                          {task.assigned_user.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
