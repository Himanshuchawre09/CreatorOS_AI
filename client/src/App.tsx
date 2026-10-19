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
import { RoleRoute } from './components/auth/RoleRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CreatorDetailPage } from './pages/CreatorDetailPage';
import { BrandDetailPage } from './pages/BrandDetailPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignFormPage } from './pages/CampaignFormPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { RequestsPage } from './pages/RequestsPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractDetailPage } from './pages/ContractDetailPage';
import { TasksPage } from './pages/TasksPage';
import { ContentReviewPage } from './pages/ContentReviewPage';
import { MessagesPage } from './pages/MessagesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AdminPage } from './pages/AdminPage';
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
                      <Route path="discover" element={<DiscoverPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="creators/:id" element={<CreatorDetailPage />} />
                      <Route path="brands/:id" element={<BrandDetailPage />} />
                      <Route path="requests" element={<RequestsPage />} />
                      <Route path="contracts" element={<ContractsPage />} />
                      <Route path="contracts/:id" element={<ContractDetailPage />} />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="content-review" element={<ContentReviewPage />} />
                      <Route path="messages" element={<MessagesPage />} />
                      <Route path="invoices" element={<InvoicesPage />} />
                      <Route path="ai-assistant" element={<AiAssistantPage />} />
                      <Route path="coming-soon" element={<ComingSoonPage />} />
                    </Route>

                    <Route element={<AppShell />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      
                      {/* Discovery accessible to all standard roles */}
                      <Route element={<RoleRoute allowedRoles={['creator', 'brand', 'freelancer', 'talentManager', 'admin']} />}>
                        <Route path="/discover" element={<DiscoverPage />} />
                        <Route path="/creators/:id" element={<CreatorDetailPage />} />
                        <Route path="/brands/:id" element={<BrandDetailPage />} />
                        <Route path="/campaigns" element={<CampaignsPage />} />
                        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                        <Route path="/requests" element={<RequestsPage />} />
                        <Route path="/contracts" element={<ContractsPage />} />
                        <Route path="/contracts/:id" element={<ContractDetailPage />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/content-review" element={<ContentReviewPage />} />
                        <Route path="/messages" element={<MessagesPage />} />
                        <Route path="/invoices" element={<InvoicesPage />} />
                        <Route path="/ai-assistant" element={<AiAssistantPage />} />
                      </Route>

                      {/* Campaign creation & editing for Brands */}
                      <Route element={<RoleRoute allowedRoles={['brand']} />}>
                        <Route path="/campaigns/new" element={<CampaignFormPage />} />
                        <Route path="/campaigns/:id/edit" element={<CampaignFormPage />} />
                      </Route>

                      {/* Profile management role-guarded */}
                      <Route element={<RoleRoute allowedRoles={['creator', 'brand', 'freelancer', 'talentManager']} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>

                      {/* Admin Console Route */}
                      <Route element={<RoleRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminPage />} />
                      </Route>

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
