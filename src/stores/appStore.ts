import { create } from 'zustand';
import type { PipelineType } from '@/types';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  visible: boolean;
  order: number;
}

const defaultSidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', visible: true, order: 0 },
  { id: 'leads', label: 'Leads', icon: 'UserPlus', path: '/leads', visible: true, order: 1 },
  { id: 'deals', label: 'Negócios', icon: 'Handshake', path: '/deals', visible: true, order: 2 },
  { id: 'contacts', label: 'Contatos', icon: 'Users', path: '/contacts', visible: true, order: 3 },
  { id: 'companies', label: 'Empresas', icon: 'Building2', path: '/companies', visible: true, order: 4 },
  { id: 'tasks', label: 'Tarefas', icon: 'CheckSquare', path: '/tasks', visible: true, order: 5 },
  { id: 'support', label: 'Suporte', icon: 'LifeBuoy', path: '/support', visible: true, order: 6 },
  { id: 'reports', label: 'Relatórios', icon: 'BarChart3', path: '/reports', visible: true, order: 7 },
  { id: 'settings', label: 'Configurações', icon: 'Settings', path: '/settings', visible: true, order: 8 },
];

interface AppState {
  sidebarCollapsed: boolean;
  sidebarItems: SidebarItem[];
  currentPipelineId: string | null;
  currentPipelineType: PipelineType | null;
  notificationsPanelOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleNotificationsPanel: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  setCurrentPipeline: (id: string | null, type: PipelineType | null) => void;
  reorderSidebarItems: (items: SidebarItem[]) => void;
  toggleSidebarItem: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  sidebarItems: defaultSidebarItems,
  currentPipelineId: null,
  currentPipelineType: null,
  notificationsPanelOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleNotificationsPanel: () => set((state) => ({ notificationsPanelOpen: !state.notificationsPanelOpen })),
  setNotificationsPanelOpen: (notificationsPanelOpen) => set({ notificationsPanelOpen }),
  setCurrentPipeline: (currentPipelineId, currentPipelineType) => set({ currentPipelineId, currentPipelineType }),
  reorderSidebarItems: (sidebarItems) => set({ sidebarItems }),
  toggleSidebarItem: (id) =>
    set((state) => ({
      sidebarItems: state.sidebarItems.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      ),
    })),
}));
