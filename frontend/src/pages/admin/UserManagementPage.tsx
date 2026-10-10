import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';

export const UserManagementPage: React.FC = () => {
  const { users, toggleUserLock } = useApp();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('User Management & Security Access')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Administer platform accounts, enforce emergency user lockouts, and manage RBAC role bindings.')}
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-semibold text-on-surface-variant">{t('Role:')}</span>
          {['all', 'USER', 'API_PROVIDER', 'ADMIN'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-body-sm transition-colors uppercase font-medium ${
                roleFilter === r
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {r === 'all' ? t('All Roles') : r === 'USER' ? t('Consumer') : r === 'API_PROVIDER' ? t('Provider') : t('Admin')}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-surface-container rounded-xl border border-outline-variant/40 px-3 py-1.5 w-full sm:w-64">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">search</span>
          <input
            type="text"
            placeholder={t('Search email, name...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-body-sm text-on-surface outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
            <tr>
              <th className="px-5 py-3.5">{t('User Identity')}</th>
              <th className="px-5 py-3.5">{t('Role')}</th>
              <th className="px-5 py-3.5">{t('Status')}</th>
              <th className="px-5 py-3.5">2FA</th>
              <th className="px-5 py-3.5">{t('Created')}</th>
              <th className="px-5 py-3.5">{t('Last Login')}</th>
              <th className="px-5 py-3.5 text-right">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">person_off</span>
                    <p className="font-semibold text-on-surface">{t('No users found')}</p>
                    <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">{t('No registered users match the selected role or search query.')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-on-surface block">{user.name}</span>
                    <span className="text-[12px] text-on-surface-variant font-code-sm">{user.email}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'API_PROVIDER' ? 'primary' : 'neutral'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    {user.twoFactorEnabled ? (
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]" title="2FA Active">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-outline text-[18px]" title="No 2FA">cancel</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant font-code-sm">
                    {new Date(user.lastLoginAt).toLocaleTimeString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <Button
                        size="sm"
                        variant={user.status === 'Locked' ? 'primary' : 'danger'}
                        onClick={() => toggleUserLock(user.id)}
                      >
                        {user.status === 'Locked' ? t('Unlock') : t('Lock Account')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
