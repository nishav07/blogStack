import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import { ToastProvider } from './shared/context/ToastContext';
import { RequireAuth } from './admin/guards/RequireAuth';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { PublicLayout } from './public/layouts/PublicLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { ArticleFormPage } from './admin/pages/ArticleFormPage';
import { HomePage } from './public/pages/HomePage';
import { ArticlePage } from './public/pages/ArticlePage';
import { CategoryPage } from './public/pages/CategoryPage';
import { NotFoundPage } from './public/pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="post/:slug" element={<ArticlePage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="articles/new" element={<ArticleFormPage />} />
                <Route path="articles/:id/edit" element={<ArticleFormPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
