import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { ApiError, formatBackendErrorMessage } from '../../services/authApi';
import { listAdminUsers, setAdminUserActive, type AdminUserRecord, type AdminUserRole } from '../../services/adminUsersApi';

type ActiveFilter = 'all' | 'active' | 'locked';

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<AdminUserRole | 'all'>('all');
  const [active, setActive] = useState<ActiveFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<{ items: AdminUserRecord[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [pendingUser, setPendingUser] = useState<AdminUserRecord | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    queueMicrotask(() => {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setLoading(true);
        setError(null);
      }
    });
    void listAdminUsers({
      search: debouncedSearch || undefined,
      role: role === 'all' ? undefined : role,
      active: active === 'all' ? undefined : active === 'active',
      page,
      pageSize,
    }, controller.signal).then(result => {
      setData({ items: result.items, total: result.total });
    }).catch(reason => {
      if (!(reason instanceof ApiError && reason.code === 'ABORTED')) {
        setError(formatBackendErrorMessage(reason));
        setData({ items: [], total: 0 });
      }
    }).finally(() => {
      if (requestId === requestIdRef.current && !controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [active, debouncedSearch, page, pageSize, retryKey, role]);

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  const confirmMutation = async () => {
    if (!pendingUser || mutatingId) return;
    const target = pendingUser;
    const nextActive = !target.active;
    setMutatingId(target.id);
    setNotice(null);
    setError(null);
    try {
      const result = await setAdminUserActive(target.id, nextActive);
      setNotice(nextActive ? `Đã mở khóa ${target.email}.` : `Đã khóa ${target.email} và thu hồi ${result.revokedSessions} phiên.`);
      setPendingUser(null);
      setRetryKey(value => value + 1);
    } catch (reason) {
      setError(formatBackendErrorMessage(reason));
      if (reason instanceof ApiError && reason.status === 404) setRetryKey(value => value + 1);
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('User Management')}</h1>
        <p className="text-body-md text-on-surface-variant">Tìm kiếm, lọc và khóa/mở khóa tài khoản. Sprint 1 chưa hỗ trợ thay đổi vai trò.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-error/30 bg-error-container/20 p-4 text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3"><span>{error}</span><Button size="sm" variant="secondary" onClick={() => setRetryKey(value => value + 1)}>Thử lại</Button></div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">{notice}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] gap-3 bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl shadow-sm">
        <label className="relative"><span className="sr-only">Tìm theo tên hoặc email</span><span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Search email, name...')} className="w-full rounded-xl border border-outline-variant/40 bg-surface-container py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary" /></label>
        <label className="flex items-center gap-2 text-body-sm"><span>{t('Role')}</span><select value={role} onChange={event => { setPage(1); setRole(event.target.value as AdminUserRole | 'all'); }} className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-on-surface"><option value="all">Tất cả</option><option value="Consumer">Consumer</option><option value="Provider">Provider</option><option value="Admin">Admin</option></select></label>
        <label className="flex items-center gap-2 text-body-sm"><span>{t('Status')}</span><select value={active} onChange={event => { setPage(1); setActive(event.target.value as ActiveFilter); }} className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-on-surface"><option value="all">Tất cả</option><option value="active">Active</option><option value="locked">Locked</option></select></label>
        <label className="flex items-center gap-2 text-body-sm"><span>Mỗi trang</span><select value={pageSize} onChange={event => { setPage(1); setPageSize(Number(event.target.value)); }} className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-on-surface"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-body-sm">
            <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold"><tr><th className="px-5 py-3.5">{t('User Identity')}</th><th className="px-5 py-3.5">{t('Role')}</th><th className="px-5 py-3.5">{t('Status')}</th><th className="px-5 py-3.5">{t('Created')}</th><th className="px-5 py-3.5 text-right">{t('Actions')}</th></tr></thead>
            <tbody className="divide-y divide-outline-variant/15 text-on-surface">
              {loading ? Array.from({ length: 5 }, (_, index) => <tr key={index} aria-hidden="true">{Array.from({ length: 5 }, (__, cell) => <td key={cell} className="px-5 py-5"><div className="h-4 rounded bg-surface-container-high animate-pulse" /></td>)}</tr>) : data.items.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-on-surface-variant"><span className="material-symbols-outlined text-[36px] opacity-50">person_off</span><p className="mt-2 font-semibold text-on-surface">{t('No users found')}</p><p className="mt-1">Không có tài khoản khớp bộ lọc hiện tại.</p></td></tr> : data.items.map(user => {
                const isSelf = user.id === currentUser?.id;
                const isMutating = mutatingId === user.id;
                return <tr key={user.id} className="hover:bg-surface-container/40"><td className="px-5 py-4"><span className="font-bold block">{user.name}</span><span className="text-[12px] text-on-surface-variant font-code-sm">{user.email}</span></td><td className="px-5 py-4"><Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Provider' ? 'primary' : 'neutral'}>{user.role}</Badge></td><td className="px-5 py-4"><Badge variant={user.active ? 'success' : 'danger'}>{user.active ? 'Active' : 'Locked'}</Badge></td><td className="px-5 py-4 text-on-surface-variant">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 text-right"><Button size="sm" variant={user.active ? 'danger' : 'primary'} disabled={isSelf || isMutating} title={isSelf ? 'Không thể khóa chính mình' : undefined} onClick={() => setPendingUser(user)}>{isMutating ? 'Đang xử lý...' : user.active ? t('Lock Account') : t('Unlock')}</Button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline-variant/20 px-5 py-4 text-body-sm text-on-surface-variant">
          <span>{data.total} kết quả · Trang {page}/{totalPages}</span>
          <div className="flex gap-2"><Button size="sm" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Trước</Button><Button size="sm" variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage(value => value + 1)}>Sau</Button></div>
        </div>
      </div>

      <Modal isOpen={Boolean(pendingUser)} onClose={() => !mutatingId && setPendingUser(null)} title={pendingUser?.active ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'} description={pendingUser?.email} maxWidth="sm">
        <p className="text-body-sm text-on-surface-variant">{pendingUser?.active ? 'Tất cả phiên đang hoạt động của người dùng sẽ bị máy chủ thu hồi.' : 'Người dùng sẽ có thể đăng nhập lại bằng thông tin hợp lệ.'}</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" disabled={Boolean(mutatingId)} onClick={() => setPendingUser(null)}>Hủy</Button><Button variant={pendingUser?.active ? 'danger' : 'primary'} disabled={Boolean(mutatingId)} onClick={() => void confirmMutation()}>{mutatingId ? 'Đang xử lý...' : 'Xác nhận'}</Button></div>
      </Modal>
    </div>
  );
};
