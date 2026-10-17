import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { RoleProvider } from './context/RoleContext';
import { AppShell } from './components/layout/AppShell';
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
        <RoleProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public SaaS Showcase & Marketing */}
                <Route path="/" element={<LandingPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* App Shell Protected/Workspace Routes */}
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="coming-soon" element={<ComingSoonPage />} />
                </Route>

                {/* Direct Dashboard & Coming Soon routes using AppShell */}
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/coming-soon" element={<ComingSoonPage />} />
                  {/* Dev-only components route registered conditionally */}
                  {import.meta.env.DEV && (
                    <Route path="/dev/components" element={<DevComponentsPage />} />
                  )}
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
