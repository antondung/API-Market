import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { CustomSelect } from '../ui/CustomSelect';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

interface WorkspaceLayoutProps {
  children?: React.ReactNode;
  workspace?: 'consumer' | 'provider' | 'admin';
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ children }) => {
  const { currentUser, switchRole } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleWorkspaceChange = (targetWorkspace: string) => {
    if (targetWorkspace === 'consumer') {
      switchRole('USER');
      navigate('/dashboard');
    } else if (targetWorkspace === 'provider') {
      switchRole('API_PROVIDER');
      navigate('/provider');
    } else if (targetWorkspace === 'admin') {
      switchRole('ADMIN');
      navigate('/admin');
    } else if (targetWorkspace === 'marketplace') {
      navigate('/marketplace');
    }
  };

  const getActiveWorkspaceKey = () => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/provider')) return 'provider';
    return 'consumer';
  };

  const consumerNavItems: NavItem[] = [
    { label: t('Overview'), path: '/dashboard', icon: 'dashboard' },
    { label: t('Explore APIs'), path: '/marketplace', icon: 'explore' },
    { label: t('My Subscriptions'), path: '/dashboard/subscriptions', icon: 'subscriptions' },
    { label: t('API Keys'), path: '/dashboard/keys', icon: 'key' },
    { label: t('Usage & Quota'), path: '/dashboard/usage', icon: 'bar_chart' },
    { label: t('Cost Guard'), path: '/dashboard/cost-guard', icon: 'shield_with_heart' },
    { label: t('Request History'), path: '/dashboard/requests', icon: 'history' },
    { label: t('Account & Settings'), path: '/dashboard/settings', icon: 'settings' }
  ];

  const providerNavItems: NavItem[] = [
    { label: t('Provider Overview'), path: '/provider', icon: 'dashboard' },
    { label: t('Verification & Legal'), path: '/provider/verification', icon: 'verified' },
    { label: t('My APIs Inventory'), path: '/provider/apis', icon: 'api' },
    { label: t('Create API Wizard'), path: '/provider/create-api', icon: 'add_circle' },
    { label: t('Endpoint Management'), path: '/provider/endpoints', icon: 'alt_route' },
    { label: t('OpenAPI Auto-Docs'), path: '/provider/import-openapi', icon: 'auto_stories' },
    { label: t('Pricing Plans'), path: '/provider/pricing', icon: 'payments' },
    { label: t('Publishing Workflow'), path: '/provider/workflow', icon: 'fact_check' },
    { label: t('Subscribers'), path: '/provider/subscribers', icon: 'group' },
    { label: t('Analytics & Health'), path: '/provider/analytics', icon: 'monitoring' }
  ];

  const adminNavItems: NavItem[] = [
    { label: t('Admin Governance'), path: '/admin', icon: 'admin_panel_settings' },
    { label: t('User Management'), path: '/admin/users', icon: 'group' },
    { label: t('Verification Queue'), path: '/admin/verifications', icon: 'verified_user' },
    { label: t('API Reviews & Approval'), path: '/admin/api-reviews', icon: 'rate_review' },
    { label: t('Reports & Moderation'), path: '/admin/reports', icon: 'report' },
    { label: t('Subscription Ledger'), path: '/admin/subscriptions', icon: 'receipt_long' },
    { label: t('Audit Logs'), path: '/admin/audit-logs', icon: 'fingerprint' },
    { label: t('Gateway Operations'), path: '/admin/gateway', icon: 'speed' }
  ];

  const getNavItems = () => {
    const key = getActiveWorkspaceKey();
    if (key === 'admin') return adminNavItems;
    if (key === 'provider') return providerNavItems;
    return consumerNavItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-[280px]' : 'w-[72px]'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-outline-variant/20">
          <Link to="/marketplace" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-headline-sm font-headline-sm font-bold text-primary leading-none">API HUB</span>
                <span className="text-[10px] uppercase font-semibold text-on-surface-variant/70 tracking-wider">
                  {getActiveWorkspaceKey().toUpperCase()}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all text-body-sm ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
                title={item.label}
              >
                <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom role indicator & switch */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-low/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-container-high">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-on-surface truncate">{currentUser.name}</p>
                <p className="text-[11px] font-code-sm text-on-surface-variant truncate uppercase">{currentUser.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'pl-[280px]' : 'pl-[72px]'}`}>

        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-6 lg:px-10">

          {/* Workspace Switcher */}
          <div className="flex items-center gap-3">
            <CustomSelect
              value={getActiveWorkspaceKey()}
              onChange={(val) => handleWorkspaceChange(val)}
              options={[
                { value: 'consumer', label: t('Consumer Workspace'), icon: 'person' },
                { value: 'provider', label: t('Provider Workspace'), icon: 'corporate_fare' },
                ...(currentUser.role === 'ADMIN'
                  ? [{ value: 'admin', label: t('Admin Console') || 'Admin Console', icon: 'shield_person' }]
                  : []),
                { value: 'marketplace', label: t('Public Marketplace') || t('Marketplace'), icon: 'storefront' },
              ]}
              icon="swap_horiz"
              className="w-60"
            />

            {/* Role Clearance Pill */}
            {currentUser.role === 'ADMIN' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-label-md font-semibold font-code-md">
                <span className="material-symbols-outlined text-[14px]">shield</span> {t('System Administrator')}
              </span>
            )}
            {currentUser.role === 'API_PROVIDER' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-label-md font-medium">
                <span className="material-symbols-outlined text-[14px]">corporate_fare</span> {t('API Provider')}
              </span>
            )}
            {currentUser.role === 'USER' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 text-label-md font-medium">
                <span className="material-symbols-outlined text-[14px]">person</span> {t('Developer')}
              </span>
            )}
          </div>

          {/* Right Header items: Language Switcher, Notifications & Quick Switch */}
          <div className="flex items-center gap-3">

            {/* Language Switcher */}
            <LanguageSwitcher variant="dropdown" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors relative"
                title={t('Notifications & Cost Guard Alerts')}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error border-2 border-surface animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-up">
                  <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                    <span className="text-body-md font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">notifications_active</span>
                      {t('Cost Guard & Activity')}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-label-md text-primary hover:underline font-medium"
                      >
                        {t('Mark all read')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/20">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-body-sm text-on-surface-variant">
                        {t('No notifications')}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-4 transition-colors cursor-pointer hover:bg-surface-container-low ${
                            !n.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                              n.type === 'critical' ? 'text-error' : n.type === 'warning' ? 'text-amber-600' : 'text-primary'
                            }`}>
                              {n.type === 'critical' ? 'report' : n.type === 'warning' ? 'warning' : 'info'}
                            </span>
                            <div className="flex-1">
                              <p className="text-body-sm font-semibold text-on-surface">{n.title}</p>
                              <p className="text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[11px] text-on-surface-variant/70 font-code-sm mt-1 block">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Public Marketplace Button */}
            <Link
              to="/marketplace"
              className="px-3.5 py-1.5 text-body-sm rounded-xl border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>{t('Marketplace')}</span>
            </Link>

            {/* Profile Avatar */}
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-sm shadow-sm">
              {currentUser.name.charAt(0)}
            </div>

          </div>

        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>

      </div>
    </div>
  );
};
