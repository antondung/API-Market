import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import {
  apiRequest,
  checkBackendHealth,
  formatBackendErrorMessage,
  type BackendTokens,
  type BackendUser
} from '../../services/authApi';

interface IsolatedSimulatedTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: BackendUser;
}

function redactToken(token?: string): string {
  if (!token) return '';
  if (token.length <= 16) return '***[REDACTED]***';
  return `${token.slice(0, 10)}...[REDACTED]`;
}

function sanitizeForDisplay(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(sanitizeForDisplay);

  const copy: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
  if (typeof copy.accessToken === 'string') copy.accessToken = redactToken(copy.accessToken);
  if (typeof copy.refreshToken === 'string') copy.refreshToken = redactToken(copy.refreshToken);
  if (copy.data && typeof copy.data === 'object') {
    copy.data = sanitizeForDisplay(copy.data);
  }
  return copy;
}

export const SessionSimulatorPage: React.FC = () => {
  const { currentUser, backendOnline } = useAuth();
  const { t } = useLanguage();

  // An toàn khi truy cập trực tiếp bằng URL mà chưa đăng nhập
  const user = currentUser ?? {
    id: 'simulated-guest',
    email: 'guest@apihub.dev',
    role: 'USER' as const,
    name: 'Guest / Chưa đăng nhập',
    status: 'Active' as const,
    createdAt: '',
    lastLoginAt: '',
    twoFactorEnabled: false,
    quotaUsedPercent: 0,
  };

  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const [accessTokenTtl, setAccessTokenTtl] = useState(840);
  const [refreshTokenRotatedCount, setRefreshTokenRotatedCount] = useState(2);
  const [liveTestRunning, setLiveTestRunning] = useState<string | null>(null);
  const [liveApiResponse, setLiveApiResponse] = useState<any>(null);
  const [simulatedIssuedAt] = useState(() => Math.floor(Date.now() / 1000));

  // Token của simulator được cô lập hoàn toàn trong memory, không ghi đè sessionStorage phiên thật
  const [simulatedTokens, setSimulatedTokens] = useState<IsolatedSimulatedTokens | null>(null);

  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    'Session initialized: Issued Access Token (15m TTL) + Rotating Refresh Token (7d TTL, SHA-256 DB Hash)',
    'Verified signature with HS256 secret key (Express 5 backend)',
    'Backend store rotation concurrency check passed'
  ]);

  const handleRunHealthCheck = async () => {
    setLiveTestRunning('health');
    try {
      const res = await checkBackendHealth();
      setLiveApiResponse(res);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /health -> 200 OK: ${JSON.stringify(res)}`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /health -> FAILED: ${formatBackendErrorMessage(err)}`,
        ...prev
      ]);
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleRunLiveLogin = async () => {
    if (!testEmail || !testPassword) {
      setLiveApiResponse({ error: 'Vui lòng nhập Email và Mật khẩu kiểm thử để thực hiện đăng nhập cô lập.' });
      return;
    }
    setLiveTestRunning('login');
    try {
      // Gọi trực tiếp apiRequest để không lưu vào sessionStorage sản xuất và không đổi phiên người dùng thật
      const response = await apiRequest<{ data: BackendTokens }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail.trim().toLowerCase(), password: testPassword }),
      });
      setSimulatedTokens(response.data);
      setLiveApiResponse(sanitizeForDisplay(response.data));
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/login -> 200 OK: Cấp JWT cô lập cho ${response.data.user.email} (${response.data.user.role})`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/login -> FAILED: ${formatBackendErrorMessage(err)}`,
        ...prev
      ]);
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleRunLiveGetMe = async () => {
    if (!simulatedTokens?.accessToken) return;
    setLiveTestRunning('me');
    try {
      const response = await apiRequest<{ data: BackendUser }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${simulatedTokens.accessToken}` },
      });
      setLiveApiResponse(response.data);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/auth/me -> 200 OK: Xác thực danh tính ${response.data.email}`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/auth/me -> FAILED: ${formatBackendErrorMessage(err)}`,
        ...prev
      ]);
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleRunLiveRefresh = async () => {
    if (!simulatedTokens?.refreshToken) return;
    setLiveTestRunning('refresh');
    try {
      const response = await apiRequest<{ data: BackendTokens }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: simulatedTokens.refreshToken }),
      });
      setSimulatedTokens(response.data);
      setLiveApiResponse(sanitizeForDisplay(response.data));
      setRefreshTokenRotatedCount(prev => prev + 1);
      setAccessTokenTtl(900);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/refresh -> 200 OK: Đã quay vòng refresh token, cấp cặp token mới`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/refresh -> FAILED: ${formatBackendErrorMessage(err)}`,
        ...prev
      ]);
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleRunRoleGuard = async (role: 'consumer' | 'provider' | 'admin') => {
    if (!simulatedTokens?.accessToken) return;
    setLiveTestRunning(`guard-${role}`);
    try {
      const res = await apiRequest<{ data: { role: string } }>(`/api/access/${role}`, {
        headers: { Authorization: `Bearer ${simulatedTokens.accessToken}` },
      });
      setLiveApiResponse(res);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/access/${role} -> 200 OK: Quyền truy cập HỢP LỆ cho vai trò ${role}`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/access/${role} -> 403/DENIED: ${formatBackendErrorMessage(err)}`,
        ...prev
      ]);
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleRunLiveLogout = async () => {
    if (!simulatedTokens?.accessToken) return;
    setLiveTestRunning('logout');
    try {
      await apiRequest<void>('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${simulatedTokens.accessToken}` },
      });
      setSimulatedTokens(null);
      setLiveApiResponse({ status: 204, message: 'Phiên kiểm thử đã được thu hồi trên máy chủ.' });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/logout -> 204 No Content: Đã thu hồi phiên kiểm thử trên backend`,
        ...prev
      ]);
    } catch (err) {
      setLiveApiResponse({ error: formatBackendErrorMessage(err) });
    } finally {
      setLiveTestRunning(null);
    }
  };

  const handleSimulateRefresh = () => {
    setAccessTokenTtl(900);
    setRefreshTokenRotatedCount(prev => prev + 1);
    setSimulatedLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Mô phỏng Refresh Token Rotation: Hủy token cũ, cấp cặp token mới (US-02)`,
      ...prev
    ]);
  };

  const handleSimulateExpire = () => {
    setAccessTokenTtl(0);
    setSimulatedLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Access Token hết hạn (HTTP 401 Unauthorized sẽ kích hoạt ở lần gọi tiếp theo)`,
      ...prev
    ]);
  };

  const sampleJwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iss: 'https://auth.apihub.dev',
    aud: 'https://gateway.apihub.dev',
    iat: simulatedIssuedAt - (900 - accessTokenTtl),
    exp: simulatedIssuedAt + accessTokenTtl,
  };

  return (
    <div className="pt-20 pb-20 px-6 max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-outline-variant/30">
        <h1 className="text-headline-lg font-bold text-on-surface">{t('Authentication & Session Lifecycle Simulator')}</h1>
        <p className="text-body-md text-on-surface-variant">
          {t('Interactive workbench demonstrating JWT Access Token expiry (15m), Refresh Token Rotation (7d), and 401 recovery (Sprint 1, US-02).')}
        </p>
      </div>

      {/* Live Backend Sprint 1 Testing Console */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-headline-sm font-bold text-on-surface">{t('Sprint 1 Backend API Integration Console')}</h3>
              <Badge variant={backendOnline ? 'success' : 'neutral'}>
                {backendOnline ? 'CONNECTED (127.0.0.1:3000)' : 'DISCONNECTED'}
              </Badge>
              <Badge variant="primary">Isolated Test Env</Badge>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Các lệnh gọi kiểm thử sử dụng bộ nhớ độc lập (in-memory) và không ghi đè phiên đăng nhập chính của trình duyệt.
            </p>
          </div>
          <Button variant="outline" size="sm" icon="refresh" onClick={handleRunHealthCheck} disabled={Boolean(liveTestRunning)}>
            {t('Kiểm tra Health')}
          </Button>
        </div>

        {/* Input credentials for testing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-container rounded-xl">
          <div>
            <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">Email kiểm thử</label>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="vd: test.consumer@apihub.dev"
              className="w-full px-3 py-2 text-body-sm rounded-lg border border-outline-variant bg-surface text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">Mật khẩu kiểm thử</label>
            <input
              type="password"
              value={testPassword}
              onChange={e => setTestPassword(e.target.value)}
              placeholder="Mật khẩu tài khoản kiểm thử"
              className="w-full px-3 py-2 text-body-sm rounded-lg border border-outline-variant bg-surface text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={handleRunLiveLogin}
            disabled={Boolean(liveTestRunning) || !testEmail || !testPassword}
          >
            {liveTestRunning === 'login' ? 'Calling...' : 'POST /api/auth/login'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunLiveGetMe}
            disabled={Boolean(liveTestRunning) || !simulatedTokens}
          >
            {liveTestRunning === 'me' ? 'Calling...' : 'GET /api/auth/me'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunLiveRefresh}
            disabled={Boolean(liveTestRunning) || !simulatedTokens}
          >
            {liveTestRunning === 'refresh' ? 'Calling...' : 'POST /api/auth/refresh'}
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleRunLiveLogout}
            disabled={Boolean(liveTestRunning) || !simulatedTokens}
          >
            {liveTestRunning === 'logout' ? 'Calling...' : 'POST /api/auth/logout'}
          </Button>
        </div>

        <div className="pt-2">
          <span className="text-[12px] font-semibold text-on-surface-variant block mb-2 uppercase tracking-wider">
            {t('RBAC Guard Endpoints (Bearer Token Access)')}
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunRoleGuard('consumer')}
              disabled={Boolean(liveTestRunning) || !simulatedTokens}
            >
              GET /api/access/consumer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunRoleGuard('provider')}
              disabled={Boolean(liveTestRunning) || !simulatedTokens}
            >
              GET /api/access/provider
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunRoleGuard('admin')}
              disabled={Boolean(liveTestRunning) || !simulatedTokens}
            >
              GET /api/access/admin
            </Button>
          </div>
        </div>

        {liveApiResponse && (
          <div className="pt-3">
            <h4 className="text-body-sm font-bold text-on-surface mb-1.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">data_object</span>
              {t('Phản hồi Backend Mới Nhất (Đã che token nhạy cảm)')}
            </h4>
            <CodeBlock
              code={JSON.stringify(liveApiResponse, null, 2)}
              language="json"
              title="Live Backend HTTP Response (Sanitized)"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Status Card */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm font-bold text-on-surface">{t('Access Token State')}</h3>
            <Badge variant={accessTokenTtl > 0 ? 'success' : 'danger'}>
              {accessTokenTtl > 0 ? 'VALID' : 'EXPIRED (401)'}
            </Badge>
          </div>

          <div>
            <div className="flex justify-between text-body-sm mb-1">
              <span className="text-on-surface-variant">{t('Time to Live (TTL)')}</span>
              <span className="font-code-md font-bold text-on-surface">{accessTokenTtl}s / 900s</span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  accessTokenTtl < 100 ? 'bg-error' : 'bg-primary'
                }`}
                style={{ width: `${(accessTokenTtl / 900) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-surface-container rounded-xl text-body-sm text-on-surface-variant space-y-1">
            <div>{t('Rotations Completed:')} <strong className="text-on-surface">{refreshTokenRotatedCount} {t('lần')}</strong></div>
            <div>{t('Storage Target:')} <strong className="text-on-surface">Client Storage (Bearer Auth) + SHA-256 DB Hash (Server)</strong></div>
            <div>{t('Signature Algorithm:')} <strong className="text-on-surface">HS256 (HMAC-SHA256)</strong></div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button variant="primary" size="sm" icon="sync" onClick={handleSimulateRefresh}>
              {t('Rotate Refresh Token')}
            </Button>
            <Button variant="danger" size="sm" icon="timer_off" onClick={handleSimulateExpire}>
              {t('Simulate Token Expiry')}
            </Button>
          </div>
        </div>

        {/* Decoded JWT Inspector */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-headline-sm font-bold text-on-surface">{t('Decoded JWT Claims')}</h3>
          <CodeBlock
            code={JSON.stringify(sampleJwtPayload, null, 2)}
            language="json"
            title="HS256 JWT Payload (Simulated)"
          />
        </div>
      </div>

      {/* Audit Activity Stream */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="text-headline-sm font-bold text-on-surface mb-3">{t('Session Lifecycle Event Stream')}</h3>
        <div className="space-y-2 font-code-md text-code-sm">
          {simulatedLogs.map((log, i) => (
            <div key={i} className="p-2.5 bg-surface-container rounded-lg text-on-surface flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">terminal</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
