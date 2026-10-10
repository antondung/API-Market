import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ApiItem,
  Subscription,
  ApiKey,
  RequestLog,
  CostGuardBudget,
  CostGuardNotification,
  ProviderVerification,
  User,
  ReportItem,
  AuditLogEntry,
  HttpMethod,
  ApiStatus
} from '../types';
import {
  INITIAL_APIS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_API_KEYS,
  INITIAL_REQUEST_LOGS,
  INITIAL_BUDGET,
  INITIAL_NOTIFICATIONS,
  INITIAL_VERIFICATIONS,
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

interface GatewayCallResult {
  statusCode: number;
  latencyMs: number;
  data: any;
  headers: Record<string, string>;
  error?: string;
}

interface AppContextType {
  apis: ApiItem[];
  subscriptions: Subscription[];
  apiKeys: ApiKey[];
  requestLogs: RequestLog[];
  budget: CostGuardBudget;
  notifications: CostGuardNotification[];
  verifications: ProviderVerification[];
  users: User[];
  reports: ReportItem[];
  auditLogs: AuditLogEntry[];
  tryGrants: Record<string, number>; // apiId -> remaining free trial calls

  // Actions
  subscribeToPlan: (apiId: string, planId: string, userId: string) => Subscription;
  cancelSubscription: (subscriptionId: string) => void;
  createApiKey: (name: string, apiId?: string, subscriptionId?: string) => { key: ApiKey; secretPlainText: string };
  rotateApiKey: (keyId: string) => { updatedKey: ApiKey; newSecretPlainText: string };
  revokeApiKey: (keyId: string) => void;
  updateBudget: (newBudget: Partial<CostGuardBudget>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  consumeTryGrant: (apiId: string) => { remaining: number; allowed: boolean };
  executeGatewayCall: (
    apiId: string,
    endpointPath: string,
    method: HttpMethod,
    apiKey?: string,
    requestBody?: string
  ) => Promise<GatewayCallResult>;

  // Provider Actions
  createApi: (newApi: Partial<ApiItem>) => ApiItem;
  updateApi: (apiId: string, updates: Partial<ApiItem>) => void;
  submitApiForReview: (apiId: string) => { success: boolean; error?: string };
  submitProviderVerification: (verification: Partial<ProviderVerification>) => void;

  // Admin Actions
  toggleUserLock: (userId: string) => void;
  approveVerification: (verificationId: string) => void;
  rejectVerification: (verificationId: string, reason: string) => void;
  updateApiStatus: (apiId: string, newStatus: ApiStatus, notes?: string) => void;
  resolveReport: (reportId: string, actionTaken: string) => void;
  suspendSubscriptionByAdmin: (subscriptionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DATA_VERSION = 'v4_clean_production_release';

if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem('apihub_data_version');
  if (currentVer !== DATA_VERSION) {
    localStorage.removeItem('apihub_apis');
    localStorage.removeItem('apihub_subscriptions');
    localStorage.removeItem('apihub_apikeys');
    localStorage.removeItem('apihub_requestlogs');
    localStorage.removeItem('apihub_budget');
    localStorage.removeItem('apihub_notifications');
    localStorage.removeItem('apihub_verifications');
    localStorage.removeItem('apihub_users');
    localStorage.removeItem('apihub_reports');
    localStorage.removeItem('apihub_auditlogs');
    localStorage.removeItem('apihub_try_grants');
    localStorage.removeItem('apihub_current_user');
    localStorage.setItem('apihub_data_version', DATA_VERSION);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apis, setApis] = useState<ApiItem[]>(() => {
    const s = localStorage.getItem('apihub_apis');
    return s ? JSON.parse(s) : INITIAL_APIS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const s = localStorage.getItem('apihub_subscriptions');
    return s ? JSON.parse(s) : INITIAL_SUBSCRIPTIONS;
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const s = localStorage.getItem('apihub_apikeys');
    return s ? JSON.parse(s) : INITIAL_API_KEYS;
  });

  const [requestLogs, setRequestLogs] = useState<RequestLog[]>(() => {
    const s = localStorage.getItem('apihub_requestlogs');
    return s ? JSON.parse(s) : INITIAL_REQUEST_LOGS;
  });

  const [budget, setBudget] = useState<CostGuardBudget>(() => {
    const s = localStorage.getItem('apihub_budget');
    return s ? JSON.parse(s) : INITIAL_BUDGET;
  });

  const [notifications, setNotifications] = useState<CostGuardNotification[]>(() => {
    const s = localStorage.getItem('apihub_notifications');
    return s ? JSON.parse(s) : INITIAL_NOTIFICATIONS;
  });

  const [verifications, setVerifications] = useState<ProviderVerification[]>(() => {
    const s = localStorage.getItem('apihub_verifications');
    return s ? JSON.parse(s) : INITIAL_VERIFICATIONS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('apihub_users');
    return s ? JSON.parse(s) : INITIAL_USERS;
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const s = localStorage.getItem('apihub_reports');
    return s ? JSON.parse(s) : INITIAL_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const s = localStorage.getItem('apihub_auditlogs');
    return s ? JSON.parse(s) : INITIAL_AUDIT_LOGS;
  });

  const [tryGrants, setTryGrants] = useState<Record<string, number>>(() => {
    const s = localStorage.getItem('apihub_try_grants');
    return s ? JSON.parse(s) : {};
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('apihub_apis', JSON.stringify(apis)); }, [apis]);
  useEffect(() => { localStorage.setItem('apihub_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('apihub_apikeys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { localStorage.setItem('apihub_requestlogs', JSON.stringify(requestLogs)); }, [requestLogs]);
  useEffect(() => { localStorage.setItem('apihub_budget', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('apihub_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('apihub_verifications', JSON.stringify(verifications)); }, [verifications]);
  useEffect(() => { localStorage.setItem('apihub_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('apihub_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('apihub_auditlogs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('apihub_try_grants', JSON.stringify(tryGrants)); }, [tryGrants]);

  const addAuditLog = (action: string, targetType: AuditLogEntry['targetType'], targetId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: 'root@apihub.internal',
      actorRole: 'ADMIN',
      action,
      targetType,
      targetId,
      ipAddress: '127.0.0.1',
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const subscribeToPlan = (apiId: string, planId: string, userId: string): Subscription => {
    const api = apis.find(a => a.id === apiId);
    if (!api) throw new Error('API not found');
    const plan = api.plans.find(p => p.id === planId) || api.plans[0];

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const keyId = `key_live_${Date.now().toString().slice(-4)}`;
    const newKey: ApiKey = {
      id: keyId,
      userId,
      apiId,
      apiName: api.name,
      name: `${api.name} - ${plan.name}`,
      keyPrefix: `ak_live_${randomSuffix}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: undefined,
      isRevoked: false,
      rateLimitPerSec: plan.rateLimitPerSec
    };

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      apiId: api.id,
      apiName: api.name,
      apiIcon: api.icon,
      planId: plan.id,
      planName: plan.name,
      tier: plan.tier,
      status: 'Active',
      startedAt: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      quotaLimit: plan.monthlyQuota,
      quotaUsed: 0,
      rateLimitPerSec: plan.rateLimitPerSec,
      priceMonthly: plan.priceMonthly,
      apiKeyId: keyId
    };

    setSubscriptions(prev => [newSub, ...prev]);
    setApiKeys(prev => [newKey, ...prev]);

    if (plan.priceMonthly > 0) {
      setBudget(prev => ({
        ...prev,
        spentUsd: prev.spentUsd + plan.priceMonthly
      }));
    }

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'info',
        title: `Subscription Activated: ${api.name}`,
        message: `Successfully subscribed to ${plan.name} ($${plan.priceMonthly}/mo). API Key auto-generated.`,
        timestamp: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);

    addAuditLog('SUBSCRIPTION_CREATED', 'SUBSCRIPTION', newSub.id, `Subscribed to ${api.name} tier ${plan.tier}`);
    return newSub;
  };

  const cancelSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, status: 'Cancelled' } : s));
    addAuditLog('SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION', subscriptionId, 'Subscription cancelled by consumer');
  };

  const createApiKey = (name: string, apiId?: string, subscriptionId?: string) => {
    const rawSecret = `ak_live_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const prefix = `${rawSecret.substring(0, 11)}...${rawSecret.substring(rawSecret.length - 4)}`;

    const api = apis.find(a => a.id === apiId);
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      userId: 'usr_consumer_01',
      apiId,
      apiName: api?.name || 'General Access',
      subscriptionId,
      name,
      keyPrefix: prefix,
      createdAt: new Date().toISOString(),
      isRevoked: false,
      rateLimitPerSec: 25
    };

    setApiKeys(prev => [newKey, ...prev]);
    addAuditLog('API_KEY_CREATED', 'SECURITY', newKey.id, `Created key "${name}"`);
    return { key: newKey, secretPlainText: rawSecret };
  };

  const rotateApiKey = (keyId: string) => {
    const rawSecret = `ak_live_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const prefix = `${rawSecret.substring(0, 11)}...${rawSecret.substring(rawSecret.length - 4)}`;

    let updated: ApiKey | undefined;
    setApiKeys(prev => prev.map(k => {
      if (k.id === keyId) {
        updated = {
          ...k,
          keyPrefix: prefix,
          createdAt: new Date().toISOString()
        };
        return updated;
      }
      return k;
    }));

    addAuditLog('API_KEY_ROTATED', 'SECURITY', keyId, `Rotated secret key for ID ${keyId}`);
    return { updatedKey: updated!, newSecretPlainText: rawSecret };
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, isRevoked: true } : k));
    addAuditLog('API_KEY_REVOKED', 'SECURITY', keyId, `Revoked API Key ${keyId}`);
  };

  const updateBudget = (newBudget: Partial<CostGuardBudget>) => {
    setBudget(prev => ({ ...prev, ...newBudget }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const consumeTryGrant = (apiId: string) => {
    const current = tryGrants[apiId] ?? 10;
    if (current <= 0) {
      return { remaining: 0, allowed: false };
    }
    const updated = current - 1;
    setTryGrants(prev => ({ ...prev, [apiId]: updated }));
    return { remaining: updated, allowed: true };
  };

  const executeGatewayCall = async (
    apiId: string,
    endpointPath: string,
    method: HttpMethod,
    apiKey?: string,
    requestBody?: string
  ): Promise<GatewayCallResult> => {
    // Artificial latency simulation
    const simulatedLatency = Math.floor(Math.random() * 25) + 20;
    await new Promise(r => setTimeout(r, simulatedLatency + 80));

    const api = apis.find(a => a.id === apiId);
    if (!api) {
      return {
        statusCode: 404,
        latencyMs: simulatedLatency,
        data: { error: { code: 'API_NOT_FOUND', message: 'API does not exist on gateway registry.' } },
        headers: { 'x-gateway': 'apihub-dp-4000', 'content-type': 'application/json' },
        error: 'API Not Found'
      };
    }

    if (api.status !== 'Published') {
      return {
        statusCode: 403,
        latencyMs: simulatedLatency,
        data: { error: { code: 'API_UNAVAILABLE', message: `API is currently in status "${api.status}". Gateway blocks non-published endpoints.` } },
        headers: { 'x-gateway': 'apihub-dp-4000' },
        error: 'API Not Published'
      };
    }

    const endpoint = api.endpoints.find(e => e.path === endpointPath);
    if (!endpoint) {
      return {
        statusCode: 404,
        latencyMs: simulatedLatency,
        data: { error: { code: 'ENDPOINT_NOT_FOUND', message: `Endpoint ${endpointPath} not found for this API.` } },
        headers: { 'x-gateway': 'apihub-dp-4000' },
        error: 'Endpoint Not Found'
      };
    }

    // SSRF Check (US-18 requirement):
    if (requestBody && (requestBody.includes('169.254.169.254') || requestBody.includes('127.0.0.1') || requestBody.includes('localhost') || requestBody.includes('10.0.'))) {
      return {
        statusCode: 400,
        latencyMs: simulatedLatency,
        data: { error: { code: 'SSRF_BLOCKED', message: 'Private IP and localhost ranges are blocked by Gateway proxy guard (US-18).' } },
        headers: { 'x-gateway': 'apihub-dp-4000' },
        error: 'SSRF Blocked'
      };
    }

    // Parse sample response or realistic fallback
    let responseData: any;
    try {
      responseData = JSON.parse(endpoint.sampleResponse);
    } catch {
      responseData = { status: 'success', timestamp: new Date().toISOString() };
    }

    // Log the request to Request History
    const logItem: RequestLog = {
      id: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      method,
      endpoint: endpointPath,
      apiName: api.name,
      statusCode: 200,
      latencyMs: simulatedLatency,
      ipAddress: '14.162.180.22',
      userAgent: 'API HUB Playground Console v4.2',
      apiKeyPrefix: apiKey ? apiKey.substring(0, 11) : 'ak_sand_play',
      redactedHeaders: {
        'host': 'gateway.apihub.io',
        'authorization': '[REDACTED]',
        'x-api-key': apiKey ? `${apiKey.substring(0, 8)}...[REDACTED]` : 'sandbox_ephemeral_[REDACTED]',
        'x-consumer-id': 'usr_consumer_01',
        'x-gateway-signature': 'sig_hmac_sha256_verified'
      },
      responseSizeKb: parseFloat((Math.random() * 2 + 0.5).toFixed(2))
    };

    setRequestLogs(prev => [logItem, ...prev.slice(0, 49)]);

    return {
      statusCode: 200,
      latencyMs: simulatedLatency,
      data: responseData,
      headers: {
        'x-gateway': 'apihub-dp-4000',
        'x-ratelimit-limit': endpoint.rateLimitPerSec.toString(),
        'x-ratelimit-remaining': (endpoint.rateLimitPerSec - 1).toString(),
        'x-latency-overhead-ms': '1.8ms',
        'content-type': 'application/json'
      }
    };
  };

  const createApi = (newApiData: Partial<ApiItem>): ApiItem => {
    const slug = (newApiData.name || 'untitled-api').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newApi: ApiItem = {
      id: `api_${Date.now()}`,
      name: newApiData.name || 'New API Product',
      slug,
      providerId: newApiData.providerId || 'usr_provider_current',
      providerName: newApiData.providerName || 'Nhà cung cấp',
      providerVerified: newApiData.providerVerified ?? false,
      category: newApiData.category || 'Machine Learning & AI',
      shortDescription: newApiData.shortDescription || 'Mô tả ngắn về API.',
      longDescription: newApiData.longDescription || 'Tài liệu chi tiết về API.',
      icon: newApiData.icon || 'api',
      status: 'Draft',
      version: newApiData.version || '1.0.0',
      baseUrl: newApiData.baseUrl || `https://gateway.apihub.io/v1/${slug}`,
      rating: 5.0,
      reviewCount: 0,
      latencyP95Ms: 40,
      uptimePercent: 100,
      subscribersCount: 0,
      totalCallsMonthly: '0',
      tags: newApiData.tags || ['API'],
      plans: newApiData.plans || [
        {
          id: `plan_free_${Date.now()}`,
          apiId: '',
          name: 'Free Community',
          tier: 'Free',
          priceMonthly: 0,
          monthlyQuota: 1000,
          rateLimitPerSec: 5,
          features: ['1,000 monthly calls', '5 req/sec rate limit']
        }
      ],
      endpoints: newApiData.endpoints || [],
      legalDeclarationCompleted: newApiData.legalDeclarationCompleted ?? false
    };

    setApis(prev => [newApi, ...prev]);
    addAuditLog('API_CREATED', 'API', newApi.id, `Created draft API ${newApi.name}`);
    return newApi;
  };

  const updateApi = (apiId: string, updates: Partial<ApiItem>) => {
    setApis(prev => prev.map(a => a.id === apiId ? { ...a, ...updates } : a));
  };

  const submitApiForReview = (apiId: string): { success: boolean; error?: string } => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return { success: false, error: 'API not found' };

    // Enforcement checks from docs_01.md:
    if (api.endpoints.length === 0) {
      return { success: false, error: 'At least one active endpoint must be declared before submission.' };
    }
    if (api.plans.length === 0) {
      return { success: false, error: 'At least one pricing plan (Free or Paid) must be configured.' };
    }
    if (!api.legalDeclarationCompleted) {
      return { success: false, error: 'You must complete the Legal Declaration and accept Provider Agreement.' };
    }

    setApis(prev => prev.map(a => a.id === apiId ? {
      ...a,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    } : a));

    addAuditLog('API_SUBMITTED_FOR_REVIEW', 'API', apiId, `API ${api.name} submitted for review`);
    return { success: true };
  };

  const submitProviderVerification = (data: Partial<ProviderVerification>) => {
    const newVer: ProviderVerification = {
      id: `pv_${Date.now()}`,
      providerId: data.providerId || 'usr_provider_current',
      providerName: data.providerName || data.companyName || 'Nhà cung cấp',
      companyName: data.companyName || '',
      businessLicense: data.businessLicense || '',
      taxCode: data.taxCode || '',
      contactEmail: data.contactEmail || '',
      website: data.website || '',
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };
    setVerifications(prev => [newVer, ...prev]);
    addAuditLog('PROVIDER_VERIFICATION_SUBMITTED', 'PROVIDER', newVer.id, `Submitted verification for ${newVer.companyName}`);
  };

  const toggleUserLock = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Locked' ? 'Active' : 'Locked';
        addAuditLog(nextStatus === 'Locked' ? 'USER_LOCKED' : 'USER_UNLOCKED', 'USER', u.id, `Status changed to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const approveVerification = (verificationId: string) => {
    setVerifications(prev => prev.map(v => v.id === verificationId ? {
      ...v,
      status: 'Verified',
      reviewedAt: new Date().toISOString()
    } : v));
    addAuditLog('PROVIDER_VERIFICATION_APPROVED', 'PROVIDER', verificationId, 'Approved business verification credentials');
  };

  const rejectVerification = (verificationId: string, reason: string) => {
    setVerifications(prev => prev.map(v => v.id === verificationId ? {
      ...v,
      status: 'Rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString()
    } : v));
    addAuditLog('PROVIDER_VERIFICATION_REJECTED', 'PROVIDER', verificationId, `Rejected verification: ${reason}`);
  };

  const updateApiStatus = (apiId: string, newStatus: ApiStatus, notes?: string) => {
    setApis(prev => prev.map(a => a.id === apiId ? {
      ...a,
      status: newStatus,
      publishedAt: newStatus === 'Published' ? new Date().toISOString() : a.publishedAt,
      complianceNotes: notes || a.complianceNotes
    } : a));
    addAuditLog(`API_STATUS_${newStatus.toUpperCase()}`, 'API', apiId, `Changed status to ${newStatus}. Notes: ${notes || 'None'}`);
  };

  const resolveReport = (reportId: string, actionTaken: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'Resolved',
      actionTaken
    } : r));
    addAuditLog('REPORT_RESOLVED', 'SECURITY', reportId, `Report resolved: ${actionTaken}`);
  };

  const suspendSubscriptionByAdmin = (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, status: 'Suspended' } : s));
    addAuditLog('SUBSCRIPTION_SUSPENDED_BY_ADMIN', 'SUBSCRIPTION', subscriptionId, 'Admin emergency suspended subscription');
  };

  return (
    <AppContext.Provider value={{
      apis,
      subscriptions,
      apiKeys,
      requestLogs,
      budget,
      notifications,
      verifications,
      users,
      reports,
      auditLogs,
      tryGrants,
      subscribeToPlan,
      cancelSubscription,
      createApiKey,
      rotateApiKey,
      revokeApiKey,
      updateBudget,
      markNotificationRead,
      markAllNotificationsRead,
      consumeTryGrant,
      executeGatewayCall,
      createApi,
      updateApi,
      submitApiForReview,
      submitProviderVerification,
      toggleUserLock,
      approveVerification,
      rejectVerification,
      updateApiStatus,
      resolveReport,
      suspendSubscriptionByAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
