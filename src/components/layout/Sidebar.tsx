import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard, UserPlus, Handshake, Users, Building2,
  CheckSquare, LifeBuoy, BarChart3, Settings, ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, UserPlus, Handshake, Users, Building2,
  CheckSquare, LifeBuoy, BarChart3, Settings,
};

export function Sidebar() {
  const { sidebarCollapsed, sidebarItems, toggleSidebar } = useAppStore();
  const { profile } = useAuthStore();

  const visibleItems = sidebarItems.filter((item) => item.visible).sort((a, b) => a.order - b.order);
  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-slate-900 text-slate-300 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-slate-700 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shrink-0">
            C
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 text-lg font-semibold text-white whitespace-nowrap">CRM Pro</span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const link = (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-primary border-l-2 border-primary'
                      : 'hover:bg-slate-800 hover:text-white',
                    sidebarCollapsed && 'justify-center px-0'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger render={<span />}>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-slate-700 p-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{profile?.full_name || 'Usuário'}</p>
                <p className="truncate text-xs text-slate-400">{profile?.job_title || profile?.role}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!sidebarCollapsed && <span className="ml-2">Recolher</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
