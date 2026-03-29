import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NotificationsPanel } from './NotificationsPanel';
import { useAppStore } from '@/stores/appStore';
import { Toaster } from 'react-hot-toast';

export function MainLayout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main
        className="transition-all duration-300 p-6"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '15rem' }}
      >
        <Outlet />
      </main>
      <NotificationsPanel />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '8px', background: '#333', color: '#fff' },
        }}
      />
    </div>
  );
}
