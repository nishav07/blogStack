import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { RequireAuth } from './admin/guards/RequireAuth';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
