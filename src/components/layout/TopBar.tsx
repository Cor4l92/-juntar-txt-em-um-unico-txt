import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Bell, User, Settings as SettingsIcon, LogOut } from 'lucide-react';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/deals': 'Negócios',
  '/contacts': 'Contatos',
  '/companies': 'Empresas',
  '/tasks': 'Tarefas',
  '/support': 'Suporte',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
  '/profile': 'Meu Perfil',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleNotificationsPanel, sidebarCollapsed } = useAppStore();
  const { profile } = useAuthStore();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const currentPage = breadcrumbMap[location.pathname] || 'CRM Pro';
  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 gap-4"
      style={{ marginLeft: sidebarCollapsed ? '4rem' : '15rem' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{currentPage}</h1>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="w-64 pl-9 h-9" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" onClick={toggleNotificationsPanel}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full inline-flex items-center justify-center hover:bg-accent">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" /> Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
