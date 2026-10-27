import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MethodBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PublicApiUnavailable } from '../../components/marketplace/PublicApiUnavailable';
import { PageReveal } from '../../components/motion/PageReveal';
import { AnimatedTabs } from '../../components/motion/AnimatedTabs';
import { getMarketplaceApiDetail } from '../../services/marketplaceApi';
import type {
  MarketplaceApiDetail,
  MarketplaceEndpoint,
} from '../../services/marketplaceTypes';
import { ApiError } from '../../services/authApi';
import {
  executePlayground,
  getSandboxGrant,
  claimSandboxGrant,
  type PlaygroundResult,
  type SandboxGrant,
} from '../../services/consumerApi';
import {
  generateCurlSnippet,
  generateFetchSnippet,
  generatePythonSnippet,
} from '../../utils/apiSnippetGenerator';

interface ExecutionResponseState extends PlaygroundResult {
  timestamp: string;
}

export type PlaygroundGrantStatus =
  | 'LOADING'
  | 'NOT_CLAIMED'
  | 'ACTIVE'
  | 'EXHAUSTED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'ERROR';

export const ApiPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated } = useAuth();

  const isConsumer = isAuthenticated && (currentUser?.role === 'USER' || (currentUser?.role as string) === 'Consumer');

  const [api, setApi] = useState<MarketplaceApiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const queryEp = searchParams.get('endpoint');
  const queryMethod = searchParams.get('method');

  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [insertKeyIntoSnippet, setInsertKeyIntoSnippet] = useState(false);

  // Endpoint parameters state
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headerParams, setHeaderParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState('{\n  "query": "test"\n}');
  const [jsonValidStatus, setJsonValidStatus] = useState<string | null>(null);

  // Sandbox grant & Authoritative Quota State Machine
  const [grant, setGrant] = useState<SandboxGrant | null>(null);
  const [isGrantLoading, setIsGrantLoading] = useState(false);
  const [isGrantClaiming, setIsGrantClaiming] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  const activeUserIdRef = useRef<string | null>(currentUser?.id ?? null);
  activeUserIdRef.current = currentUser?.id ?? null;

  // Active execution request tracking for race condition prevention
  const activeExecutionControllerRef = useRef<AbortController | null>(null);
  const grantFetchControllerRef = useRef<AbortController | null>(null);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResponse, setExecutionResponse] = useState<ExecutionResponseState | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Security lifecycle: Wipe sensitive credentials on unmount, API switch, or logout
  useEffect(() => {
    const handleLogout = () => {
      if (activeExecutionControllerRef.current) {
        activeExecutionControllerRef.current.abort();
        activeExecutionControllerRef.current = null;
      }
      if (grantFetchControllerRef.current) {
        grantFetchControllerRef.current.abort();
        grantFetchControllerRef.current = null;
      }
      setApiKeyInput('');
      setShowApiKeyInput(false);
      setHeaderParams({});
      setInsertKeyIntoSnippet(false);
      setExecutionResponse(null);
      setExecutionError(null);
      setGrant(null);
      setGrantError(null);
      setIsGrantLoading(false);
    };

    window.addEventListener('apihub:session-invalidated', handleLogout);
    return () => {
      if (activeExecutionControllerRef.current) {
        activeExecutionControllerRef.current.abort();
        activeExecutionControllerRef.current = null;
      }
      if (grantFetchControllerRef.current) {
        grantFetchControllerRef.current.abort();
        grantFetchControllerRef.current = null;
      }
      setApiKeyInput('');
      setShowApiKeyInput(false);
      setHeaderParams({});
      setInsertKeyIntoSnippet(false);
      window.removeEventListener('apihub:session-invalidated', handleLogout);
    };
  }, [id]);

  // Tabs
  const [requestTab, setRequestTab] = useState<'params' | 'headers' | 'body'>('params');
  const [rightPanelTab, setRightPanelTab] = useState<'snippets' | 'response'>('snippets');
  const [codeLang, setCodeLang] = useState<'curl' | 'javascript' | 'python'>('curl');

  // Proxy advisory modal
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Extract path parameter names from a template string like `/v1/users/{userId}/posts/{postId}`
  const extractPathParams = (path: string): string[] => {
    const matches = path.match(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g);
    if (!matches) return [];
    return matches.map(m => m.slice(1, -1));
  };

  const initEndpointParams = (ep: MarketplaceEndpoint) => {
    const qParams: Record<string, string> = {};
    const hParams: Record<string, string> = {};
    const pParams: Record<string, string> = {};

    // Path parameters
    const extractedParams = extractPathParams(ep.path);
    extractedParams.forEach(paramName => {
      pParams[paramName] = '';
    });

    if (Array.isArray(ep.parameters)) {
      ep.parameters.forEach((p: any) => {
        const name = p?.name;
        if (!name) return;
        if (p.in === 'path') {
          pParams[name] = p.default !== undefined ? String(p.default) : (pParams[name] || '');
        } else if (p.in === 'query') {
          qParams[name] = p.default !== undefined ? String(p.default) : '';
        } else if (p.in === 'header') {
          const lower = name.toLowerCase();
          if (['accept', 'accept-language', 'content-type'].includes(lower)) {
            hParams[name] = p.default !== undefined ? String(p.default) : '';
          }
        }
      });
    }

    setPathParams(pParams);
    setQueryParams(qParams);
    setHeaderParams(hParams);
    setExecutionResponse(null);
    setExecutionError(null);

    if (ep.requestSchema) {
      setRequestBody(JSON.stringify(ep.requestSchema, null, 2));
    } else if (ep.method.toUpperCase() === 'GET' || ep.method.toUpperCase() === 'DELETE') {
      setRequestBody('');
    } else {
      setRequestBody('{\n  "example": true\n}');
    }
  };

  // Load API Details
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMarketplaceApiDetail(id, controller.signal);
        if (controller.signal.aborted) return;
        setApi(data);

        if (data.endpoints && data.endpoints.length > 0) {
          const matched = (queryEp && queryMethod)
            ? data.endpoints.find(e => e.path === queryEp && e.method.toUpperCase() === queryMethod.toUpperCase())
            : (queryEp ? data.endpoints.find(e => e.path === queryEp) : data.endpoints[0]);

          const initialEndpoint = matched || data.endpoints[0];
          setSelectedEndpointId(initialEndpoint.id);
          initEndpointParams(initialEndpoint);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', 'Lỗi tải chi tiết'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
    };
  }, [id, queryEp, queryMethod]);

  // Read Sandbox Grant Quota for authenticated Consumer
  useEffect(() => {
    if (!id || !isConsumer) {
      setGrant(null);
      setGrantError(null);
      setIsGrantLoading(false);
      return;
    }

    if (grantFetchControllerRef.current) {
      grantFetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    grantFetchControllerRef.current = controller;
    const requestingUserId = currentUser?.id;
    setIsGrantLoading(true);
    setGrantError(null);

    getSandboxGrant(id, controller.signal)
      .then(data => {
        if (!controller.signal.aborted && activeUserIdRef.current === requestingUserId) {
          setGrant(data);
          setGrantError(null);
        }
      })
      .catch((err: any) => {
        if (controller.signal.aborted || activeUserIdRef.current !== requestingUserId) return;
        const status = err?.status ?? (err instanceof ApiError ? err.status : undefined);
        if (status === 404) {
          setGrant(null);
          setGrantError(null);
        } else if (status === 403) {
          setGrant(null);
          setGrantError(t('Tài khoản Consumer không có quyền truy cập Sandbox này.'));
        } else {
          setGrant(null);
          setGrantError(err?.message || t('Lỗi kiểm tra trạng thái Sandbox grant.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && activeUserIdRef.current === requestingUserId) {
          setIsGrantLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [id, isConsumer, currentUser?.id]);

  // Claim Sandbox Grant handler
  const handleClaimGrant = async () => {
    if (!id || !isConsumer) return;
    if (grantFetchControllerRef.current) {
      grantFetchControllerRef.current.abort();
      grantFetchControllerRef.current = null;
    }
    try {
      setIsGrantClaiming(true);
      setGrantError(null);
      const data = await claimSandboxGrant(id);
      setGrant(data);
      setIsGrantLoading(false);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setGrantError(err.message || t('Không thể kích hoạt Sandbox Grant.'));
      } else {
        setGrantError(t('Lỗi kết nối máy chủ'));
      }
    } finally {
      setIsGrantClaiming(false);
    }
  };

  const selectedEndpoint = useMemo(() => {
    if (!api || !api.endpoints) return null;
    return api.endpoints.find(e => e.id === selectedEndpointId) || api.endpoints[0] || null;
  }, [api, selectedEndpointId]);

  const handleEndpointSelect = (newId: string) => {
    // Abort active in-flight playground request when switching endpoints to prevent race conditions
    if (activeExecutionControllerRef.current) {
      activeExecutionControllerRef.current.abort();
      activeExecutionControllerRef.current = null;
    }
    setIsExecuting(false);
    setSelectedEndpointId(newId);
    const ep = api?.endpoints.find(e => e.id === newId);
    if (ep) {
      initEndpointParams(ep);
    }
  };

  // Resolved concrete path substituting pathParams
  const resolvedConcretePath = useMemo(() => {
    if (!selectedEndpoint) return '/';
    let path = selectedEndpoint.path;
    for (const [key, val] of Object.entries(pathParams)) {
      if (val) {
        path = path.replace(`{${key}}`, encodeURIComponent(val));
      }
    }
    return path;
  }, [selectedEndpoint, pathParams]);

  // Resolved API key for code snippets: default to safe placeholder unless user explicitly opts in
  const resolvedApiKey = useMemo(() => {
    return (insertKeyIntoSnippet && apiKeyInput.trim()) ? apiKeyInput.trim() : 'YOUR_API_KEY';
  }, [insertKeyIntoSnippet, apiKeyInput]);

  // Generate dynamic cURL command via hardened generator
  const generatedCurl = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generateCurlSnippet({
      method: selectedEndpoint.method,
      urlPath: resolvedConcretePath,
      apiKey: resolvedApiKey,
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, resolvedConcretePath, resolvedApiKey, queryParams, headerParams, requestBody]);

  // Generate JavaScript fetch via hardened generator
  const generatedJs = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generateFetchSnippet({
      method: selectedEndpoint.method,
      urlPath: resolvedConcretePath,
      apiKey: resolvedApiKey,
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, resolvedConcretePath, resolvedApiKey, queryParams, headerParams, requestBody]);

  // Generate Python requests via hardened generator
  const generatedPython = useMemo(() => {
    if (!api || !selectedEndpoint) return '';

    return generatePythonSnippet({
      method: selectedEndpoint.method,
      urlPath: resolvedConcretePath,
      apiKey: resolvedApiKey,
      queryParams,
      headers: headerParams,
      body: requestBody,
      includeTemplateNotice: true,
    });
  }, [api, selectedEndpoint, resolvedConcretePath, resolvedApiKey, queryParams, headerParams, requestBody]);

  const activeSnippet = useMemo(() => {
    if (codeLang === 'curl') return generatedCurl;
    if (codeLang === 'javascript') return generatedJs;
    return generatedPython;
  }, [codeLang, generatedCurl, generatedJs, generatedPython]);

  const copyToClipboard = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(activeSnippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      } catch {
        // clipboard access denied - do not show false positive copy success
      }
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
      setJsonValidStatus('JSON hợp lệ');
      setTimeout(() => setJsonValidStatus(null), 2000);
    } catch (e: any) {
      setJsonValidStatus('Lỗi cú pháp: ' + (e?.message || 'Invalid JSON'));
      setTimeout(() => setJsonValidStatus(null), 3000);
    }
  };

  // Sandbox grant & Authoritative Quota State Machine
  const grantStatus: PlaygroundGrantStatus = useMemo(() => {
    if (!isConsumer) return 'NOT_CLAIMED';
    if (isGrantLoading) return 'LOADING';
    if (grantError) return 'ERROR';
    if (!grant) return 'NOT_CLAIMED';
    if (grant.revokedAt !== null) return 'REVOKED';
    if (new Date(grant.expiresAt).getTime() <= Date.now()) return 'EXPIRED';
    if (grant.remainingRequests <= 0 || !grant.available || grant.usedRequests >= grant.maxRequests) {
      return 'EXHAUSTED';
    }
    return 'ACTIVE';
  }, [isConsumer, isGrantLoading, grantError, grant]);

  // Strict eligibility: grant must be active and user must be Consumer
  const isGrantEligible = isConsumer && grantStatus === 'ACTIVE';

  const sendButtonDisabled = !isGrantEligible || isExecuting || !selectedEndpoint;

  const sendButtonTooltip = useMemo(() => {
    if (!isAuthenticated) return t('Yêu cầu đăng nhập tài khoản Consumer để thực thi');
    if (!isConsumer) return t('Chỉ tài khoản Consumer mới có quyền sử dụng Playground');
    if (grantStatus === 'LOADING') return t('Đang kiểm tra quyền Sandbox...');
    if (grantStatus === 'NOT_CLAIMED') return t('Chưa kích hoạt Sandbox Grant. Vui lòng nhận grant trước khi thử nghiệm.');
    if (grantStatus === 'EXHAUSTED') return t('Hạn mức Sandbox đã hết (0 lượt còn lại). Vui lòng nâng cấp gói.');
    if (grantStatus === 'EXPIRED') return t('Sandbox Grant đã hết hạn (24 giờ).');
    if (grantStatus === 'REVOKED') return t('Sandbox Grant đã bị thu hồi.');
    if (grantStatus === 'ERROR') return t('Lỗi kiểm tra quyền Sandbox.');
    return undefined;
  }, [isAuthenticated, isConsumer, grantStatus, t]);

  // Execute Playground Request
  const handleSendRequest = async () => {
    if (!api || !selectedEndpoint || !isGrantEligible) return;

    // Validate body if non-GET
    let parsedBody: unknown = undefined;
    const isBodyAllowed = selectedEndpoint.method.toUpperCase() !== 'GET' && selectedEndpoint.method.toUpperCase() !== 'DELETE';
    if (isBodyAllowed && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (err: any) {
        setExecutionError(t('Payload không đúng định dạng JSON: ') + (err?.message || 'Invalid JSON'));
        setRequestTab('body');
        return;
      }
    }

    if (activeExecutionControllerRef.current) {
      activeExecutionControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeExecutionControllerRef.current = controller;

    try {
      setIsExecuting(true);
      setExecutionError(null);

      // Clean query params (drop empty values)
      const cleanQuery: Record<string, string> = {};
      for (const [k, v] of Object.entries(queryParams)) {
        if (v.trim()) cleanQuery[k] = v.trim();
      }

      // Clean path params
      const cleanPathParams: Record<string, string> = {};
      for (const [k, v] of Object.entries(pathParams)) {
        if (v.trim()) cleanPathParams[k] = v.trim();
      }

      // Filter headers: allow only presentation headers
      const cleanHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(headerParams)) {
        const lower = k.toLowerCase();
        if (['accept', 'accept-language', 'content-type'].includes(lower) && v.trim()) {
          cleanHeaders[lower] = v.trim();
        }
      }

      const res = await executePlayground(api.id, {
        endpointId: selectedEndpoint.id,
        pathParams: Object.keys(cleanPathParams).length > 0 ? cleanPathParams : undefined,
        query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
        headers: Object.keys(cleanHeaders).length > 0 ? cleanHeaders : undefined,
        body: parsedBody,
      }, controller.signal);

      if (controller.signal.aborted) return;

      // Update state with live response
      setExecutionResponse({
        ...res,
        timestamp: new Date().toISOString(),
      });

      // Update local grant quota authoritatively: strictly rely on backend res.remainingRequests
      setGrant(prev => {
        if (!prev) return null;
        return {
          ...prev,
          remainingRequests: res.remainingRequests,
          usedRequests: Math.max(0, prev.maxRequests - res.remainingRequests),
          available: res.remainingRequests > 0,
        };
      });

      // Automatically switch right panel to response tab
      setRightPanelTab('response');
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'AbortError') {
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setExecutionError(t('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
        } else if (err.status === 403) {
          setExecutionError(t('Truy cập bị từ chối: Hạn mức Sandbox đã hết hoặc cần tài khoản Consumer.'));
        } else if (err.status === 404) {
          setExecutionError(t('Endpoint không tồn tại hoặc chưa được đăng ký trong hệ thống.'));
        } else if (err.status === 502 || err.status === 504) {
          setExecutionError(t('Lỗi Gateway Upstream: Nhà cung cấp phản hồi quá hạn (10s) hoặc không thể kết nối.'));
        } else {
          setExecutionError(err.message || t('Lỗi thực thi yêu cầu trên Gateway.'));
        }
      } else {
        setExecutionError(t('Lỗi kết nối máy chủ'));
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsExecuting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-48 mb-6" />
        <div className="h-10 bg-surface-container-high rounded w-96 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
          <div className="h-96 bg-surface-container-low rounded-2xl border border-outline-variant/30" />
        </div>
      </div>
    );
  }

  if (error || !api || !api.endpoints || api.endpoints.length === 0) {
    return <PublicApiUnavailable />;
  }

  return (
    <PageReveal className="pt-20 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/marketplace" className="hover:text-primary transition-colors">{t('Marketplace')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link to={`/api/${api.id}`} className="hover:text-primary transition-colors">{api.name}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">{t('Interactive Playground')}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
              {t('API Playground & Gateway Sandbox')}
            </h1>
            {isConsumer && (
              grantStatus === 'LOADING' ? (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-semibold border bg-surface-container-high text-on-surface-variant animate-pulse">
                  {t('Đang tải Quota...')}
                </span>
              ) : grantStatus === 'ACTIVE' && grant ? (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-bold border bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30">
                  {t('Quota:')} {grant.remainingRequests}/{grant.maxRequests}
                </span>
              ) : grantStatus === 'EXHAUSTED' && grant ? (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-bold border bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30">
                  {t('Quota:')} 0/{grant.maxRequests} ({t('Exhausted')})
                </span>
              ) : grantStatus === 'EXPIRED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-bold border bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30">
                  {t('Expired')}
                </span>
              ) : grantStatus === 'REVOKED' ? (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-bold border bg-red-500/15 text-red-800 dark:text-red-200 border-red-500/30">
                  {t('Revoked')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-label-sm font-semibold border bg-surface-container-high text-on-surface-variant border-outline-variant/30">
                  {t('No Grant Yet')}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/api/${api.id}/try-sandbox`}
            className="px-3.5 py-1.5 rounded-xl border border-outline-variant text-body-sm text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">science</span>
            <span>{t('Try Sandbox & Quota')}</span>
          </Link>
          <Link
            to={`/api/${api.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high text-body-sm text-on-surface font-medium hover:bg-surface-container-highest transition-colors"
          >
            {t('API Overview')}
          </Link>
        </div>
      </div>

      {/* Gateway SafeProxy Security Status Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[22px] mt-0.5 flex-shrink-0">
          shield
        </span>
        <div className="text-body-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">
            {t('Chính sách Gateway Proxy & Chống SSRF:')}
          </strong>{' '}
          {t('Playground thực thi lệnh gọi an toàn qua SafeProxy: địa chỉ máy chủ đích được DNS pinning, chặn mọi IP nội bộ/loopback, từ chối HTTP redirects, áp dụng giới hạn thời gian 10 giây và dung lượng tối đa 2MB.')}
        </div>
      </div>

      {/* RBAC Prompt Banner when unauthenticated */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-body-sm text-amber-900 dark:text-amber-200">
            <strong>{t('Yêu cầu đăng nhập Consumer:')}</strong>{' '}
            {t('Để gửi request trực tiếp từ Playground và sử dụng 5 lượt thử nghiệm Sandbox miễn phí, vui lòng đăng nhập tài khoản Consumer.')}
          </div>
          <Link to="/login" state={{ from: `/api/${api.id}/playground` }}>
            <Button variant="primary" size="sm" icon="login">
              {t('Đăng nhập Consumer')}
            </Button>
          </Link>
        </div>
      )}

      {/* Grant State Machine Action Banners for Consumer */}
      {isConsumer && grantStatus === 'NOT_CLAIMED' && (
        <div className="mb-6 p-4 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-body-sm text-on-surface-variant">
            <strong className="text-on-surface block mb-0.5">{t('Chưa kích hoạt Sandbox Grant')}</strong>
            {t('Kích hoạt để nhận 5 lượt gọi thử nghiệm miễn phí lưu trữ an toàn trên máy chủ (hiệu lực 24 giờ).')}
          </div>
          <Button
            variant="primary"
            size="sm"
            icon="science"
            disabled={isGrantClaiming}
            onClick={handleClaimGrant}
          >
            {isGrantClaiming ? t('Đang kích hoạt...') : t('Kích hoạt Sandbox Grant')}
          </Button>
        </div>
      )}

      {isConsumer && grantStatus === 'EXHAUSTED' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-body-sm text-amber-900 dark:text-amber-200">
            <strong className="block mb-0.5">{t('Hạn mức Sandbox đã hết (0 lượt còn lại)')}</strong>
            {t('Bạn đã sử dụng hết 5 lượt gọi thử nghiệm. Vui lòng đăng ký gói chính thức hoặc sử dụng API Key cá nhân để tiếp tục.')}
          </div>
          <Link to={`/api/${api.id}`}>
            <Button variant="primary" size="sm" icon="payments">
              {t('Xem các gói dịch vụ')}
            </Button>
          </Link>
        </div>
      )}

      {isConsumer && grantStatus === 'EXPIRED' && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="text-body-sm text-amber-900 dark:text-amber-200">
            <strong className="block mb-0.5">{t('Sandbox Grant đã hết hạn')}</strong>
            {t('Thời hạn 24 giờ của Sandbox grant đã kết thúc. Vui lòng đăng ký gói dịch vụ chính thức.')}
          </div>
          <Link to={`/api/${api.id}`}>
            <Button variant="primary" size="sm" icon="payments">
              {t('Xem các gói')}
            </Button>
          </Link>
        </div>
      )}

      {isConsumer && grantStatus === 'REVOKED' && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
          <div className="text-body-sm text-red-700 dark:text-red-300">
            <strong className="block mb-0.5">{t('Sandbox Grant đã bị thu hồi')}</strong>
            {t('Quyền truy cập thử nghiệm cho API này đã bị vô hiệu hóa.')}
          </div>
        </div>
      )}

      {isConsumer && grantStatus === 'ERROR' && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
          <div className="text-body-sm text-red-700 dark:text-red-300">
            <strong className="block mb-0.5">{t('Lỗi kiểm tra quyền Sandbox')}</strong>
            {grantError}
          </div>
        </div>
      )}

      {/* Playground Workbench Layout: 2-column request / response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Request Configuration */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                {t('Request Builder')}
              </h3>
              <span className="text-body-xs font-code-sm text-on-surface-variant">
                Endpoint: <code className="text-primary font-bold">{selectedEndpoint?.path}</code>
              </span>
            </div>

            {/* Endpoint Selector Bar */}
            <div>
              <label htmlFor="playground-endpoint-select" className="text-body-sm font-medium text-on-surface block mb-1.5">{t('Select Endpoint')}</label>
              <div className="flex items-center gap-2 p-2 bg-surface-container rounded-xl border border-outline-variant/30">
                <MethodBadge method={selectedEndpoint?.method as any || 'GET'} />
                <select
                  id="playground-endpoint-select"
                  aria-label={t('Select Endpoint') || 'Select Endpoint'}
                  value={selectedEndpointId}
                  onChange={(e) => handleEndpointSelect(e.target.value)}
                  className="bg-transparent flex-1 text-on-surface font-code-md text-body-sm outline-none cursor-pointer"
                >
                  {api.endpoints.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.method} {ep.path} {ep.description ? `— ${ep.description.slice(0, 30)}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Request Configuration Tabs */}
            <div className="pt-1">
              <AnimatedTabs
                tabs={[
                  { id: 'params', label: `${t('Params')} (${Object.keys(pathParams).length + Object.keys(queryParams).length})`, icon: 'tune' },
                  { id: 'headers', label: `${t('Headers')} (${Object.keys(headerParams).length + 1})`, icon: 'view_headline' },
                  { id: 'body', label: t('Body'), icon: 'data_object' },
                ]}
                activeTab={requestTab}
                onChange={(tabId) => setRequestTab(tabId as typeof requestTab)}
                layoutId="playground-request-tabs"
              />
            </div>

            {/* Tab: Path & Query Params */}
            {requestTab === 'params' && (
              <div className="space-y-4">
                {/* Path Parameters Section */}
                {Object.keys(pathParams).length > 0 && (
                  <div className="space-y-2">
                    <label className="text-body-xs font-semibold text-primary block">
                      {t('Path Parameters (URL Segments):')}
                    </label>
                    <div className="space-y-2 bg-surface-container p-3 rounded-xl border border-outline-variant/20">
                      {Object.entries(pathParams).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-1/3 font-code-sm text-on-surface font-semibold truncate" title={key}>
                            {`{${key}}`}
                          </span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                            placeholder={`Giá trị ${key}`}
                            className="flex-1 bg-surface-container-high px-2.5 py-1.5 rounded-lg text-body-sm font-code-sm text-on-surface outline-none border border-outline-variant/30 focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Query Parameters Section */}
                <div className="space-y-2">
                  <label className="text-body-xs font-semibold text-on-surface-variant block">
                    {t('Query Parameters:')}
                  </label>
                  {Object.keys(queryParams).length === 0 ? (
                    <div className="p-4 text-center text-body-xs text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant/20">
                      {t('Endpoint này không yêu cầu tham số query.')}
                    </div>
                  ) : (
                    <div className="space-y-2 bg-surface-container p-3.5 rounded-xl border border-outline-variant/20">
                      {Object.entries(queryParams).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-1/3 font-code-sm text-on-surface font-medium truncate" title={key}>
                            {key}
                          </span>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                            placeholder={`Giá trị ${key}`}
                            className="flex-1 bg-surface-container-high px-2.5 py-1.5 rounded-lg text-body-sm font-code-sm text-on-surface outline-none border border-outline-variant/30 focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Headers */}
            {requestTab === 'headers' && (
              <div className="space-y-3">
                <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/20 space-y-3">
                  <div>
                    <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">
                      X-API-Key (Sandbox Authorization)
                    </label>
                    <div className="flex items-center bg-surface-container-high rounded-lg border border-outline-variant/30 px-3 py-1.5">
                      <span className="material-symbols-outlined text-on-surface-variant text-[16px] mr-2">key</span>
                      <input
                        type={showApiKeyInput ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={t('Enter API Key')}
                        autoComplete="off"
                        className="w-full bg-transparent font-code-md text-code-sm text-on-surface focus:outline-none"
                      />
                      {apiKeyInput && (
                        <button
                          type="button"
                          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                          className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer ml-1"
                          title={showApiKeyInput ? t('Ẩn') : t('Hiện')}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {showApiKeyInput ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      )}
                    </div>
                    {apiKeyInput.trim() && (
                      <label className="flex items-center gap-2 mt-2 text-body-xs text-on-surface-variant cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={insertKeyIntoSnippet}
                          onChange={(e) => setInsertKeyIntoSnippet(e.target.checked)}
                          className="rounded border-outline-variant/40 text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>{t('Chèn API Key thật vào snippet (Mặc định: hiển thị "YOUR_API_KEY" để an toàn khi chia sẻ)')}</span>
                      </label>
                    )}
                  </div>

                  {Object.entries(headerParams).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-body-xs font-semibold text-on-surface-variant block mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setHeaderParams({ ...headerParams, [key]: e.target.value })}
                        className="w-full bg-surface-container-high px-3 py-1.5 rounded-lg text-code-sm font-code-sm text-on-surface outline-none border border-outline-variant/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Request Body */}
            {requestTab === 'body' && (
              <div className="space-y-2">
                {selectedEndpoint && (selectedEndpoint.method.toUpperCase() === 'GET' || selectedEndpoint.method.toUpperCase() === 'DELETE') ? (
                  <div className="p-6 text-center text-body-xs text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant/20">
                    {t('Phương thức HTTP')} {selectedEndpoint.method} {t('không sử dụng Request Body.')}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-body-xs font-semibold text-on-surface-variant">
                        {t('Payload JSON Body')}
                      </label>
                      <div className="flex items-center gap-2">
                        {jsonValidStatus && (
                          <span className={`text-[11px] font-bold ${jsonValidStatus.startsWith('Lỗi') ? 'text-error' : 'text-emerald-800 dark:text-emerald-200'}`}>
                            {jsonValidStatus}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleFormatJson}
                          className="text-label-md text-primary hover:underline font-medium cursor-pointer"
                        >
                          {t('Format JSON')}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full p-3 font-code-md text-code-sm bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            )}

            {executionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-body-xs text-red-600 dark:text-red-400">
                {executionError}
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="pt-4 mt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-body-xs text-on-surface-variant">
              {grantStatus === 'ACTIVE' && grant
                ? `${t('Lượt gọi còn lại:')} ${grant.remainingRequests}/${grant.maxRequests}`
                : grantStatus === 'EXHAUSTED'
                  ? t('Hạn mức Sandbox đã hết (0 lượt còn lại)')
                  : grantStatus === 'NOT_CLAIMED'
                    ? t('Chưa kích hoạt Sandbox Grant')
                    : grantStatus === 'EXPIRED'
                      ? t('Sandbox Grant đã hết hạn')
                      : grantStatus === 'REVOKED'
                        ? t('Sandbox Grant đã bị thu hồi')
                        : grantStatus === 'LOADING'
                          ? t('Đang tải thông tin Sandbox...')
                          : t('Định tuyến kiểm thử qua SafeProxy')}
            </span>
            <Button
              variant="primary"
              size="md"
              icon="send"
              disabled={sendButtonDisabled}
              title={sendButtonTooltip}
              onClick={handleSendRequest}
            >
              {isExecuting ? t('Đang gửi...') : t('Send Request')}
            </Button>
          </div>
        </div>

        {/* Right Column: Code Generator & Live Response */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <AnimatedTabs
                tabs={[
                  { id: 'snippets', label: t('Code Snippets'), icon: 'code' },
                  {
                    id: 'response',
                    label: executionResponse ? `${t('Response')} (${executionResponse.status})` : t('Response Schema'),
                    icon: 'data_object',
                  },
                ]}
                activeTab={rightPanelTab}
                onChange={(tabId) => setRightPanelTab(tabId as typeof rightPanelTab)}
                layoutId="playground-right-panel-tabs"
              />
              {rightPanelTab === 'snippets' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedSnippet ? 'check' : 'content_copy'}
                  onClick={copyToClipboard}
                >
                  {copiedSnippet ? t('Copied!') : t('Copy Snippet')}
                </Button>
              )}
            </div>

            {rightPanelTab === 'snippets' && (
              <>
                <div className="flex items-center gap-2">
                  {(['curl', 'javascript', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLang(lang)}
                      className={`px-3 py-1 rounded-lg text-body-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        codeLang === lang
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript (fetch)' : 'Python'}
                    </button>
                  ))}
                </div>

                {apiKeyInput.trim() && (
                  <div className="flex items-center justify-between text-body-xs bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/30">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
                      {insertKeyIntoSnippet
                        ? t('Mã lệnh đang hiển thị API Key của bạn.')
                        : t('Mã lệnh đang dùng "YOUR_API_KEY" để an toàn khi chia sẻ.')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInsertKeyIntoSnippet(!insertKeyIntoSnippet)}
                      className="text-primary hover:underline font-medium cursor-pointer text-body-xs ml-2"
                    >
                      {insertKeyIntoSnippet ? t('Dùng "YOUR_API_KEY"') : t('Chèn API Key thật')}
                    </button>
                  </div>
                )}

                <CodeBlock
                  code={activeSnippet}
                  language={codeLang === 'curl' ? 'bash' : codeLang}
                />
              </>
            )}

            {rightPanelTab === 'response' && (
              <div>
                {executionResponse ? (
                  /* Live Real Response from Backend */
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface-container rounded-xl border border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-body-xs font-bold ${
                          executionResponse.status >= 200 && executionResponse.status < 300
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30'
                            : executionResponse.status >= 400 && executionResponse.status < 500
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-800 dark:text-red-200 border border-red-500/30'
                        }`}>
                          {executionResponse.status}
                        </span>
                        <span className="text-body-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          {executionResponse.latencyMs} ms
                        </span>
                      </div>
                      <span className="text-body-xs text-primary font-medium">
                        {t('Còn lại:')} {executionResponse.remainingRequests} requests
                      </span>
                    </div>

                    {/* Response Headers */}
                    {Object.keys(executionResponse.headers).length > 0 && (
                      <div>
                        <div className="text-caption font-semibold text-on-surface-variant mb-1">
                          {t('Response Headers (Upstream):')}
                        </div>
                        <div className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/20 text-code-xs font-code-sm space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(executionResponse.headers).map(([hk, hv]) => (
                            <div key={hk} className="flex gap-2">
                              <span className="text-on-surface-variant font-bold">{hk}:</span>
                              <span className="text-on-surface truncate">{hv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response Body */}
                    <div>
                      <div className="text-caption font-semibold text-on-surface-variant mb-1">
                        {t('Response Body:')}
                      </div>
                      <CodeBlock
                        code={
                          (() => {
                            try {
                              return JSON.stringify(JSON.parse(executionResponse.body), null, 2);
                            } catch {
                              return executionResponse.body;
                            }
                          })()
                        }
                        language="json"
                      />
                    </div>
                  </div>
                ) : (
                  /* Example Response Schema Fallback when not yet executed */
                  <div>
                    <div className="text-body-xs text-on-surface-variant mb-2 flex items-center justify-between">
                      <span>{t('Dự kiến kết quả phản hồi (Expected 200 OK):')}</span>
                      {Boolean(selectedEndpoint?.responseExample) && <span className="text-emerald-800 dark:text-emerald-200 font-bold text-xs">200 OK</span>}
                    </div>
                    <CodeBlock
                      code={
                        selectedEndpoint?.responseExample
                          ? (typeof selectedEndpoint.responseExample === 'string'
                              ? selectedEndpoint.responseExample
                              : JSON.stringify(selectedEndpoint.responseExample, null, 2))
                          : JSON.stringify({
                              status: 'success',
                              code: 200,
                              message: 'Gateway proxy returns sanitized upstream response payload.',
                              endpoint: selectedEndpoint?.path,
                              method: selectedEndpoint?.method,
                              timestamp: '2026-10-24T22:00:00.000Z',
                              sample: true,
                            }, null, 2)
                      }
                      language="json"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
              <h4 className="text-body-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                {t('Hướng dẫn kiểm thử:')}
              </h4>
              <ol className="text-body-xs text-on-surface-variant list-decimal pl-4 space-y-1">
                <li>{t('Nhấn Send Request để kiểm thử trực tiếp qua phiên đăng nhập Consumer.')}</li>
                <li>{t('Sao chép lệnh cURL ở trên để chạy từ Terminal với API Key cá nhân.')}</li>
                <li>{t('Tất cả lưu lượng được kiểm soát an toàn và tính vào hạn mức người dùng.')}</li>
              </ol>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-outline-variant/30 text-body-xs text-on-surface-variant">
            {t('Gateway SSRF Guard đảm bảo các địa chỉ loopback (127.0.0.1) và mạng nội bộ không thể bị xâm nhập.')}
          </div>
        </div>

      </div>

      {/* Proxy Advisory Modal */}
      <Modal
        isOpen={proxyModalOpen}
        onClose={() => setProxyModalOpen(false)}
        title={t('Gateway SSRF Proxy Notice')}
        description={t('Thông báo kết nối qua API Gateway')}
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-body-sm text-on-surface">
            <div className="flex items-center gap-2 font-bold mb-1 text-primary">
              <span className="material-symbols-outlined text-[20px]">shield</span>
              <span>{t('Bảo vệ an ninh SafeProxy')}</span>
            </div>
            <p className="text-body-xs leading-relaxed text-on-surface-variant">
              {t('Yêu cầu kiểm thử được gửi an toàn qua SafeProxy trên máy chủ với địa chỉ IP được xác thực qua DNS pinning, bảo vệ hoàn toàn khỏi nguy cơ SSRF.')}
            </p>
          </div>

          <p className="text-body-sm text-on-surface">
            {t('Lệnh cURL tương ứng sẵn sàng để thực thi từ terminal của bạn:')}
          </p>

          <CodeBlock
            code={generatedCurl}
            language="bash"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              variant="outline"
              onClick={() => setProxyModalOpen(false)}
            >
              {t('Đóng')}
            </Button>
            <Button
              variant="primary"
              icon={copiedSnippet ? 'check' : 'content_copy'}
              onClick={copyToClipboard}
            >
              {copiedSnippet ? t('Copied!') : t('Copy cURL')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageReveal>
  );
};
