import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { startAutoTranslator } from './i18n/autoTranslator';
import { getCurrentLanguage } from './i18n';

// Layout Components
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';

// Marketplace & Discovery Pages
import { MarketplacePage } from './pages/marketplace/MarketplacePage';
import { ApiDetailPage } from './pages/marketplace/ApiDetailPage';
import { ApiPlaygroundPage } from './pages/marketplace/ApiPlaygroundPage';
import { TrySandboxPage } from './pages/marketplace/TrySandboxPage';
import { CompareApisPage } from './pages/marketplace/CompareApisPage';
import { PricingPage } from './pages/marketplace/PricingPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';

// Auth & Access Control Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SessionSimulatorPage } from './pages/auth/SessionSimulatorPage';
import { Unauthorized401Page } from './pages/auth/Unauthorized401Page';
import { Forbidden403Page } from './pages/auth/Forbidden403Page';

// Consumer Workspace Pages
import { ConsumerDashboardPage } from './pages/consumer/ConsumerDashboardPage';
import { MySubscriptionsPage } from './pages/consumer/MySubscriptionsPage';
import { ApiKeysPage } from './pages/consumer/ApiKeysPage';
import { UsageQuotaPage } from './pages/consumer/UsageQuotaPage';
import { CostGuardPage } from './pages/consumer/CostGuardPage';
import { RequestHistoryPage } from './pages/consumer/RequestHistoryPage';
import { ProfileSettingsPage } from './pages/consumer/ProfileSettingsPage';

// Provider Workspace Pages
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage';
import { ProviderVerificationPage } from './pages/provider/ProviderVerificationPage';
import { MyApisInventoryPage } from './pages/provider/MyApisInventoryPage';
import { CreateApiWizardPage } from './pages/provider/CreateApiWizardPage';
import { EndpointManagementPage } from './pages/provider/EndpointManagementPage';
import { OpenApiImportPage } from './pages/provider/OpenApiImportPage';
import { PricingManagementPage } from './pages/provider/PricingManagementPage';
import { PublishingWorkflowPage } from './pages/provider/PublishingWorkflowPage';
import { SubscribersPage } from './pages/provider/SubscribersPage';
import { AnalyticsHealthPage } from './pages/provider/AnalyticsHealthPage';

// Admin Workspace Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ProviderVerificationsPage } from './pages/admin/ProviderVerificationsPage';
import { ApiReviewsPage } from './pages/admin/ApiReviewsPage';
import { ReportsModerationPage } from './pages/admin/ReportsModerationPage';
import { SubscriptionMonitoringPage } from './pages/admin/SubscriptionMonitoringPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { GatewayOperationsPage } from './pages/admin/GatewayOperationsPage';

import type { UserRole } from './types';

// Layout Wrappers
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body">
    <PublicNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);

// Route Guards
const ProtectedRoute: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/401" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" state={{ from: location.pathname, requiredRoles: allowedRoles }} replace />;
  }

  return <Outlet />;
};

export function App() {
  React.useEffect(() => {
    const stop = startAutoTranslator(getCurrentLanguage);
    return stop;
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* PUBLIC & MARKETPLACE ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<MarketplacePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/api/:id" element={<ApiDetailPage />} />
              <Route path="/api/:id/playground" element={<ApiPlaygroundPage />} />
              <Route path="/api/:id/try-sandbox" element={<TrySandboxPage />} />
              <Route path="/compare" element={<CompareApisPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/checkout/:apiId/:planId" element={<CheckoutPage />} />

              {/* AUTH & GATE PAGES */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/session-simulator" element={<SessionSimulatorPage />} />
              <Route path="/401" element={<Unauthorized401Page />} />
              <Route path="/403" element={<Forbidden403Page />} />
            </Route>

            {/* CONSUMER WORKSPACE ROUTES (Protected: USER, API_PROVIDER, ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'API_PROVIDER', 'ADMIN']} />}>
              <Route
                element={
                  <WorkspaceLayout workspace="consumer">
                    <Outlet />
                  </WorkspaceLayout>
                }
              >
                <Route path="/dashboard" element={<ConsumerDashboardPage />} />
                <Route path="/dashboard/subscriptions" element={<MySubscriptionsPage />} />
                <Route path="/dashboard/keys" element={<ApiKeysPage />} />
                <Route path="/dashboard/api-keys" element={<Navigate to="/dashboard/keys" replace />} />
                <Route path="/dashboard/usage" element={<UsageQuotaPage />} />
                <Route path="/dashboard/cost-guard" element={<CostGuardPage />} />
                <Route path="/dashboard/requests" element={<RequestHistoryPage />} />
                <Route path="/dashboard/history" element={<Navigate to="/dashboard/requests" replace />} />
                <Route path="/dashboard/settings" element={<ProfileSettingsPage />} />
                <Route path="/dashboard/profile" element={<Navigate to="/dashboard/settings" replace />} />
              </Route>
            </Route>

            {/* PROVIDER WORKSPACE ROUTES (Protected: API_PROVIDER, ADMIN) */}
            <Route element={<ProtectedRoute allowedRoles={['API_PROVIDER', 'ADMIN']} />}>
              <Route
                element={
                  <WorkspaceLayout workspace="provider">
                    <Outlet />
                  </WorkspaceLayout>
                }
              >
                <Route path="/provider" element={<ProviderDashboardPage />} />
                <Route path="/provider/apis" element={<MyApisInventoryPage />} />
                <Route path="/provider/create-api" element={<CreateApiWizardPage />} />
                <Route path="/provider/endpoints" element={<EndpointManagementPage />} />
                <Route path="/provider/import-openapi" element={<OpenApiImportPage />} />
                <Route path="/provider/openapi-import" element={<Navigate to="/provider/import-openapi" replace />} />
                <Route path="/provider/pricing" element={<PricingManagementPage />} />
                <Route path="/provider/workflow" element={<PublishingWorkflowPage />} />
                <Route path="/provider/subscribers" element={<SubscribersPage />} />
                <Route path="/provider/analytics" element={<AnalyticsHealthPage />} />
                <Route path="/provider/verification" element={<ProviderVerificationPage />} />
              </Route>
            </Route>

            {/* ADMIN WORKSPACE ROUTES (Protected: ADMIN only) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route
                element={
                  <WorkspaceLayout workspace="admin">
                    <Outlet />
                  </WorkspaceLayout>
                }
              >
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/verifications" element={<ProviderVerificationsPage />} />
                <Route path="/admin/api-reviews" element={<ApiReviewsPage />} />
                <Route path="/admin/reports" element={<ReportsModerationPage />} />
                <Route path="/admin/subscriptions" element={<SubscriptionMonitoringPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/gateway" element={<GatewayOperationsPage />} />
                <Route path="/admin/monitoring" element={<Navigate to="/admin/gateway" replace />} />
              </Route>
            </Route>

            {/* CATCH ALL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
