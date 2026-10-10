import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CodeBlock } from '../../components/ui/CodeBlock';
import {
  login as apiLogin,
  getMe,
  refresh as apiRefresh,
  logout as apiLogout,
  checkRoleAccess,
  checkBackendHealth,
  getSavedTokens,
  formatBackendErrorMessage,
  type SavedTokens
} from '../../services/authApi';

export const SessionSimulatorPage: React.FC = () => {
  const { currentUser, backendOnline } = useAuth();
  // Trang nay nam trong route duoc bao ve nen currentUser luon co gia tri.
  const user = currentUser!;
  const { t } = useLanguage();

  const [accessTokenTtl, setAccessTokenTtl] = useState(840);
  const [refreshTokenRotatedCount, setRefreshTokenRotatedCount] = useState(2);
  const [liveTestRunning, setLiveTestRunning] = useState<string | null>(null);
  const [liveApiResponse, setLiveApiResponse] = useState<any>(null);
  const [liveTokens, setLiveTokens] = useState<SavedTokens | null>(() => getSavedTokens());

  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    'Session initialized: Issued Access Token (15m TTL) + Rotating Refresh Token (7d TTL)',
    'Verified signature with RS256 public key',
    'Redis token rotation lock acquired'
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
    setLiveTestRunning('login');
    try {
      const tokens = await apiLogin({ email: 'test.consumer@apihub.dev', password: 'Password123!@#' });
      setLiveTokens(tokens);
      setLiveApiResponse(tokens);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/login -> 200 OK: Issued JWT for ${tokens.user.email} (${tokens.user.role})`,
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
    setLiveTestRunning('me');
    try {
      const me = await getMe();
      setLiveApiResponse(me);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/auth/me -> 200 OK: Validated identity for ${me.email}`,
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
    setLiveTestRunning('refresh');
    try {
      const tokens = await apiRefresh();
      setLiveTokens(tokens);
      setLiveApiResponse(tokens);
      setRefreshTokenRotatedCount(prev => prev + 1);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/refresh -> 200 OK: Rotated refresh token, new token issued`,
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
    setLiveTestRunning(`guard-${role}`);
    try {
      const res = await checkRoleAccess(role);
      setLiveApiResponse(res);
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] GET /api/access/${role} -> 200 OK: Access GRANTED for role ${role}`,
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
    setLiveTestRunning('logout');
    try {
      await apiLogout();
      setLiveTokens(null);
      setLiveApiResponse({ status: 204, message: 'Session revoked successfully in backend.' });
      setSimulatedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] POST /api/auth/logout -> 204 No Content: Session revoked on backend`,
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
      `[${new Date().toLocaleTimeString()}] Refresh Token Rotation Triggered: Old token invalidated, issued new pair (US-02)`,
      ...prev
    ]);
  };

  const handleSimulateExpire = () => {
    setAccessTokenTtl(0);
    setSimulatedLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Access Token Expired (HTTP 401 Unauthorized triggered on next API call)`,
      ...prev
    ]);
  };

  const sampleJwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iss: "https://auth.apihub.io",
    aud: "https://gateway.apihub.io",
    iat: Math.floor(Date.now() / 1000) - (900 - accessTokenTtl),
    exp: Math.floor(Date.now() / 1000) + accessTokenTtl
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
            </div>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              {t('Thực hiện các lệnh gọi HTTP trực tiếp đến backend theo tài liệu OpenAPI từ PR #30 / develop.')}
            </p>
          </div>
          <Button variant="outline" size="sm" icon="refresh" onClick={handleRunHealthCheck} disabled={Boolean(liveTestRunning)}>
            {t('Kiểm tra Health')}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={handleRunLiveLogin}
            disabled={Boolean(liveTestRunning)}
          >
            {liveTestRunning === 'login' ? 'Calling...' : 'POST /api/auth/login'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunLiveGetMe}
            disabled={Boolean(liveTestRunning) || !liveTokens}
          >
            {liveTestRunning === 'me' ? 'Calling...' : 'GET /api/auth/me'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunLiveRefresh}
            disabled={Boolean(liveTestRunning) || !liveTokens}
          >
            {liveTestRunning === 'refresh' ? 'Calling...' : 'POST /api/auth/refresh'}
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleRunLiveLogout}
            disabled={Boolean(liveTestRunning) || !liveTokens}
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
              disabled={Boolean(liveTestRunning) || !liveTokens}
            >
              GET /api/access/consumer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunRoleGuard('provider')}
              disabled={Boolean(liveTestRunning) || !liveTokens}
            >
              GET /api/access/provider
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRunRoleGuard('admin')}
              disabled={Boolean(liveTestRunning) || !liveTokens}
            >
              GET /api/access/admin
            </Button>
          </div>
        </div>

        {liveApiResponse && (
          <div className="pt-3">
            <h4 className="text-body-sm font-bold text-on-surface mb-1.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">data_object</span>
              {t('Phản hồi Backend Mới Nhất')}
            </h4>
            <CodeBlock
              code={JSON.stringify(liveApiResponse, null, 2)}
              language="json"
              title="Live Backend HTTP Response"
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
            <div>{t('Storage Target:')} <strong className="text-on-surface">HttpOnly Cookie + SHA-256 DB Hash</strong></div>
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
            title="RS256 JWT Payload"
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
