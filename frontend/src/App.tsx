import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { startAutoTranslator } from './i18n/autoTranslator';
import { getCurrentLanguage } from './i18n';

// Layout Components
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { WorkspaceLayout } from './components/layout/WorkspaceLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MotionProvider } from './components/motion/MotionProvider';

// Lazy-loaded Marketplace & Discovery Pages
const MarketplacePage = React.lazy(() => import('./pages/marketplace/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const ApiDetailPage = React.lazy(() => import('./pages/marketplace/ApiDetailPage').then(m => ({ default: m.ApiDetailPage })));
const ApiPlaygroundPage = React.lazy(() => import('./pages/marketplace/ApiPlaygroundPage').then(m => ({ default: m.ApiPlaygroundPage })));
const TrySandboxPage = React.lazy(() => import('./pages/marketplace/TrySandboxPage').then(m => ({ default: m.TrySandboxPage })));
const CompareApisPage = React.lazy(() => import('./pages/marketplace/CompareApisPage').then(m => ({ default: m.CompareApisPage })));
const PricingPage = React.lazy(() => import('./pages/marketplace/PricingPage').then(m => ({ default: m.PricingPage })));
const CheckoutPage = React.lazy(() => import('./pages/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));

// Lazy-loaded Auth & Access Control Pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const SessionSimulatorPage = React.lazy(() => import('./pages/auth/SessionSimulatorPage').then(m => ({ default: m.SessionSimulatorPage })));
const Unauthorized401Page = React.lazy(() => import('./pages/auth/Unauthorized401Page').then(m => ({ default: m.Unauthorized401Page })));
const Forbidden403Page = React.lazy(() => import('./pages/auth/Forbidden403Page').then(m => ({ default: m.Forbidden403Page })));

// Lazy-loaded Consumer Workspace Pages
const ConsumerDashboardPage = React.lazy(() => import('./pages/consumer/ConsumerDashboardPage').then(m => ({ default: m.ConsumerDashboardPage })));
const MySubscriptionsPage = React.lazy(() => import('./pages/consumer/MySubscriptionsPage').then(m => ({ default: m.MySubscriptionsPage })));
const ApiKeysPage = React.lazy(() => import('./pages/consumer/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const UsageQuotaPage = React.lazy(() => import('./pages/consumer/UsageQuotaPage').then(m => ({ default: m.UsageQuotaPage })));
const CostGuardPage = React.lazy(() => import('./pages/consumer/CostGuardPage').then(m => ({ default: m.CostGuardPage })));
const RequestHistoryPage = React.lazy(() => import('./pages/consumer/RequestHistoryPage').then(m => ({ default: m.RequestHistoryPage })));
const ProfileSettingsPage = React.lazy(() => import('./pages/consumer/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsPage })));

// Lazy-loaded Provider Workspace Pages
const ProviderDashboardPage = React.lazy(() => import('./pages/provider/ProviderDashboardPage').then(m => ({ default: m.ProviderDashboardPage })));
const ProviderVerificationPage = React.lazy(() => import('./pages/provider/ProviderVerificationPage').then(m => ({ default: m.ProviderVerificationPage })));
const MyApisInventoryPage = React.lazy(() => import('./pages/provider/MyApisInventoryPage').then(m => ({ default: m.MyApisInventoryPage })));
const CreateApiWizardPage = React.lazy(() => import('./pages/provider/CreateApiWizardPage').then(m => ({ default: m.CreateApiWizardPage })));
const EndpointManagementPage = React.lazy(() => import('./pages/provider/EndpointManagementPage').then(m => ({ default: m.EndpointManagementPage })));
const OpenApiImportPage = React.lazy(() => import('./pages/provider/OpenApiImportPage').then(m => ({ default: m.OpenApiImportPage })));
const PricingManagementPage = React.lazy(() => import('./pages/provider/PricingManagementPage').then(m => ({ default: m.PricingManagementPage })));
const PublishingWorkflowPage = React.lazy(() => import('./pages/provider/PublishingWorkflowPage').then(m => ({ default: m.PublishingWorkflowPage })));
const SubscribersPage = React.lazy(() => import('./pages/provider/SubscribersPage').then(m => ({ default: m.SubscribersPage })));
const AnalyticsHealthPage = React.lazy(() => import('./pages/provider/AnalyticsHealthPage').then(m => ({ default: m.AnalyticsHealthPage })));

// Lazy-loaded Admin Workspace Pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const ProviderVerificationsPage = React.lazy(() => import('./pages/admin/ProviderVerificationsPage').then(m => ({ default: m.ProviderVerificationsPage })));
const ApiReviewsPage = React.lazy(() => import('./pages/admin/ApiReviewsPage').then(m => ({ default: m.ApiReviewsPage })));
const ReportsModerationPage = React.lazy(() => import('./pages/admin/ReportsModerationPage').then(m => ({ default: m.ReportsModerationPage })));
const SubscriptionMonitoringPage = React.lazy(() => import('./pages/admin/SubscriptionMonitoringPage').then(m => ({ default: m.SubscriptionMonitoringPage })));
const AuditLogsPage = React.lazy(() => import('./pages/admin/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const GatewayOperationsPage = React.lazy(() => import('./pages/admin/GatewayOperationsPage').then(m => ({ default: m.GatewayOperationsPage })));

// Page Loading Suspense Fallback
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-body-sm text-on-surface-variant font-medium">Đang tải...</span>
    </div>
  </div>
);

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

const ScopedAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const scope = currentUser?.id ?? 'anonymous';
  return <AppProvider key={scope} storageScope={scope}>{children}</AppProvider>;
};

export function App() {
  React.useEffect(() => {
    const stop = startAutoTranslator(getCurrentLanguage);
    return stop;
  }, []);

  return (
    <BrowserRouter>
      <MotionProvider>
        <AuthProvider>
          <ScopedAppProvider>
          <React.Suspense fallback={<PageLoadingFallback />}>
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
              {/* Trang kiem thu tich hop backend: chi mo o moi truong development */}
              {import.meta.env.DEV && (
                <Route path="/auth/session-simulator" element={<SessionSimulatorPage />} />
              )}
              <Route path="/401" element={<Unauthorized401Page />} />
              <Route path="/403" element={<Forbidden403Page />} />
            </Route>

            {/* Provider có quyền sử dụng Consumer workspace; Admin chỉ dùng Admin workspace. */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'API_PROVIDER']} />}>
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

            <Route element={<ProtectedRoute allowedRoles={['API_PROVIDER']} />}>
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
                <Route path="/provider/publishing-workflow" element={<PublishingWorkflowPage />} />
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
        </React.Suspense>
      </ScopedAppProvider>
      </AuthProvider>
      </MotionProvider>
    </BrowserRouter>
  );
}

export default App;
