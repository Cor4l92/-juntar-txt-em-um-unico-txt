import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/shared/PrivateRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ProfilePage } from '@/pages/auth/ProfilePage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<PlaceholderPage title="Leads" />} />
          <Route path="deals" element={<PlaceholderPage title="Negócios" />} />
          <Route path="contacts" element={<PlaceholderPage title="Contatos" />} />
          <Route path="companies" element={<PlaceholderPage title="Empresas" />} />
          <Route path="tasks" element={<PlaceholderPage title="Tarefas" />} />
          <Route path="support" element={<PlaceholderPage title="Suporte" />} />
          <Route path="reports" element={<PlaceholderPage title="Relatórios" />} />
          <Route path="settings" element={<PlaceholderPage title="Configurações" />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
