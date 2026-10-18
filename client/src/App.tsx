import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DevComponentsPage } from './pages/DevComponentsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RoleProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public SaaS Showcase & Marketing */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Public Authentication Routes (redirects logged-in users to /dashboard) */}
                  <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>

                  {/* Protected App Routes (redirects unauthenticated users to /login) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<AppShell />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="coming-soon" element={<ComingSoonPage />} />
                    </Route>

                    <Route element={<AppShell />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/coming-soon" element={<ComingSoonPage />} />
                      {import.meta.env.DEV && (
                        <Route path="/dev/components" element={<DevComponentsPage />} />
                      )}
                    </Route>
                  </Route>

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </RoleProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
