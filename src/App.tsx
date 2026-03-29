import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/components/shared/PrivateRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ProfilePage } from '@/pages/auth/ProfilePage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { DealsPage } from '@/pages/crm/DealsPage';
import { LeadsPage } from '@/pages/crm/LeadsPage';
import { ContactsPage } from '@/pages/crm/ContactsPage';
import { CompaniesPage } from '@/pages/crm/CompaniesPage';
import { TasksPage } from '@/pages/crm/TasksPage';
import { TicketsPage } from '@/pages/crm/TicketsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

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
          <Route path="leads" element={<LeadsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="support" element={<TicketsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
