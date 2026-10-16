import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MethodBadge, Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useLanguage } from '../../i18n';
import {
  listProviderApis,
  listProviderVersions,
  createProviderVersion,
  updateProviderVersion,
  deleteProviderVersion,
  listProviderEndpoints,
  createProviderEndpoint,
  updateProviderEndpoint,
  deleteProviderEndpoint,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type {
  ProviderApi,
  ProviderVersion,
  ProviderEndpoint,
  HttpMethod,
} from '../../services/providerTypes';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const EndpointManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const queryApiId = searchParams.get('api');

  // APIs data
  const [apis, setApis] = useState<ProviderApi[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>(queryApiId || '');
  const [loadingApis, setLoadingApis] = useState(true);

  // Versions data
  const [versions, setVersions] = useState<ProviderVersion[]>([]);
  const [selectedVersionFilter, setSelectedVersionFilter] = useState<string>('ALL');

  // Endpoints data
  const [endpoints, setEndpoints] = useState<ProviderEndpoint[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Version Modals
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<ProviderVersion | null>(null);
  const [versionInput, setVersionInput] = useState('');
  const [changelogInput, setChangelogInput] = useState('');
  const [versionSubmitting, setVersionSubmitting] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<ProviderVersion | null>(null);
  const [deletingVersion, setDeletingVersion] = useState(false);

  // Endpoint Modals
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ProviderEndpoint | null>(null);
  const [epVersionId, setEpVersionId] = useState('');
  const [epMethod, setEpMethod] = useState<HttpMethod>('GET');
  const [epPath, setEpPath] = useState('');
  const [epDescription, setEpDescription] = useState('');
  const [epParametersJson, setEpParametersJson] = useState('[]');
  const [epRequestSchemaJson, setEpRequestSchemaJson] = useState('');
  const [epResponseExampleJson, setEpResponseExampleJson] = useState('{\n  "status": "success"\n}');
  const [epSubmitting, setEpSubmitting] = useState(false);
  const [epError, setEpError] = useState<string | null>(null);
  const [deleteEpTarget, setDeleteEpTarget] = useState<ProviderEndpoint | null>(null);
  const [deletingEp, setDeletingEp] = useState(false);

  // 1. Fetch APIs list on mount
  useEffect(() => {
    const controller = new AbortController();
    setLoadingApis(true);
    listProviderApis(1, 100, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          const items = res.items || [];
          setApis(items);
          if (items.length > 0) {
            const currentSelected = queryApiId && items.some(a => a.id === queryApiId)
              ? queryApiId
              : items[0].id;
            setSelectedApiId(currentSelected);
          }
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingApis(false);
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  // Sync searchParam when selectedApiId changes
  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
    setSearchParams({ api: apiId });
  };

  // 2. Fetch Versions and Endpoints when selectedApiId changes
  useEffect(() => {
    if (!selectedApiId) return;

    const controller = new AbortController();
    setLoadingDetails(true);
    setError(null);

    Promise.all([
      listProviderVersions(selectedApiId, controller.signal),
      listProviderEndpoints(selectedApiId, controller.signal),
    ])
      .then(([vRes, eRes]) => {
        if (!controller.signal.aborted) {
          setVersions(vRes || []);
          setEndpoints(eRes || []);
          if (vRes?.length && !epVersionId) {
            setEpVersionId(vRes[0].id);
          }
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      });

    return () => controller.abort();
  }, [selectedApiId, retryKey]);

  const selectedApi = apis.find(a => a.id === selectedApiId);

  // 3. Version CRUD handlers
  const handleOpenCreateVersion = () => {
    setEditingVersion(null);
    setVersionInput('');
    setChangelogInput('');
    setVersionError(null);
    setIsVersionModalOpen(true);
  };

  const handleOpenEditVersion = (v: ProviderVersion) => {
    setEditingVersion(v);
    setVersionInput(v.version);
    setChangelogInput(v.changelog || '');
    setVersionError(null);
    setIsVersionModalOpen(true);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiId || versionSubmitting) return;

    const trimmedVer = versionInput.trim();
    if (!trimmedVer) {
      setVersionError('Vui lòng nhập định danh phiên bản (VD: 1.0.0)');
      return;
    }

    setVersionSubmitting(true);
    setVersionError(null);
    try {
      if (editingVersion) {
        const updated = await updateProviderVersion(selectedApiId, editingVersion.id, {
          version: trimmedVer,
          changelog: changelogInput.trim(),
        });
        setVersions(prev => prev.map(v => (v.id === updated.id ? updated : v)));
      } else {
        const created = await createProviderVersion(selectedApiId, {
          version: trimmedVer,
          changelog: changelogInput.trim(),
        });
        setVersions(prev => [...prev, created]);
        if (!epVersionId) setEpVersionId(created.id);
      }
      setIsVersionModalOpen(false);
    } catch (err) {
      setVersionError(formatProviderErrorMessage(err));
    } finally {
      setVersionSubmitting(false);
    }
  };

  const handleConfirmDeleteVersion = async () => {
    if (!selectedApiId || !deleteVersionTarget) return;
    setDeletingVersion(true);
    try {
      await deleteProviderVersion(selectedApiId, deleteVersionTarget.id);
      setVersions(prev => prev.filter(v => v.id !== deleteVersionTarget.id));
      setDeleteVersionTarget(null);
    } catch (err) {
      alert(formatProviderErrorMessage(err));
    } finally {
      setDeletingVersion(false);
    }
  };

  // 4. Endpoint CRUD handlers
  const handleOpenCreateEndpoint = () => {
    setEditingEndpoint(null);
    setEpVersionId(versions[0]?.id || '');
    setEpMethod('GET');
    setEpPath('');
    setEpDescription('');
    setEpParametersJson('[]');
    setEpRequestSchemaJson('');
    setEpResponseExampleJson('{\n  "status": "success"\n}');
    setEpError(null);
    setIsEndpointModalOpen(true);
  };

  const handleOpenEditEndpoint = (ep: ProviderEndpoint) => {
    setEditingEndpoint(ep);
    setEpVersionId(ep.versionId);
    setEpMethod(ep.method);
    setEpPath(ep.path);
    setEpDescription(ep.description || '');
    setEpParametersJson(JSON.stringify(ep.parameters || [], null, 2));
    setEpRequestSchemaJson(ep.requestSchema ? JSON.stringify(ep.requestSchema, null, 2) : '');
    setEpResponseExampleJson(ep.responseExample ? JSON.stringify(ep.responseExample, null, 2) : '');
    setEpError(null);
    setIsEndpointModalOpen(true);
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiId || epSubmitting) return;

    const trimmedPath = epPath.trim();
    if (!trimmedPath) {
      setEpError('Đường dẫn Route Path không được để trống.');
      return;
    }

    if (!epVersionId) {
      setEpError('Vui lòng chọn hoặc tạo ít nhất một phiên bản API trước.');
      return;
    }

    let parsedParameters = [];
    if (epParametersJson.trim()) {
      try {
        parsedParameters = JSON.parse(epParametersJson);
        if (!Array.isArray(parsedParameters)) {
          setEpError('Parameters phải là một mảng JSON (Array).');
          return;
        }
      } catch {
        setEpError('Cú pháp JSON của Parameters không hợp lệ.');
        return;
      }
    }

    let parsedRequestSchema = null;
    if (epRequestSchemaJson.trim()) {
      try {
        parsedRequestSchema = JSON.parse(epRequestSchemaJson);
      } catch {
        setEpError('Cú pháp JSON của Request Schema không hợp lệ.');
        return;
      }
    }

    let parsedResponseExample = null;
    if (epResponseExampleJson.trim()) {
      try {
        parsedResponseExample = JSON.parse(epResponseExampleJson);
      } catch {
        setEpError('Cú pháp JSON của Response Example không hợp lệ.');
        return;
      }
    }

    setEpSubmitting(true);
    setEpError(null);
    try {
      const payload = {
        versionId: epVersionId,
        method: epMethod,
        path: trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`,
        description: epDescription.trim(),
        parameters: parsedParameters,
        requestSchema: parsedRequestSchema,
        responseExample: parsedResponseExample,
      };

      if (editingEndpoint) {
        const updated = await updateProviderEndpoint(selectedApiId, editingEndpoint.id, payload);
        setEndpoints(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createProviderEndpoint(selectedApiId, payload);
        setEndpoints(prev => [...prev, created]);
      }
      setIsEndpointModalOpen(false);
    } catch (err) {
      setEpError(formatProviderErrorMessage(err));
    } finally {
      setEpSubmitting(false);
    }
  };

  const handleConfirmDeleteEndpoint = async () => {
    if (!selectedApiId || !deleteEpTarget) return;
    setDeletingEp(true);
    try {
      await deleteProviderEndpoint(selectedApiId, deleteEpTarget.id);
      setEndpoints(prev => prev.filter(e => e.id !== deleteEpTarget.id));
      setDeleteEpTarget(null);
    } catch (err) {
      alert(formatProviderErrorMessage(err));
    } finally {
      setDeletingEp(false);
    }
  };

  // Filter endpoints by version tab
  const filteredEndpoints = endpoints.filter(ep => {
    if (selectedVersionFilter === 'ALL') return true;
    return ep.versionId === selectedVersionFilter;
  });

  if (loadingApis) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading endpoint page">
        <div className="h-20 bg-surface-container-high rounded-2xl" />
        <div className="h-96 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-xl mx-auto my-12">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">alt_route</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('Chưa có API nào để quản lý Endpoint')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
          {t('Bạn cần tạo một sản phẩm API trước khi có thể thiết lập các tuyến đường Endpoint và phản hồi Mock.')}
        </p>
        <Button variant="primary" icon="add_circle" onClick={() => navigate('/provider/create-api')}>
          {t('Tạo API Mới')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & API Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
            <Link to="/provider/apis" className="hover:text-primary">{t('My APIs')}</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">{selectedApi?.name || 'API'}</span>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t('Endpoint Route Management')}</h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Define HTTP methods, route paths, parameter schemas, and specific Redis rate limit burst ceilings.')}
          </p>
        </div>

        {/* API Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-body-sm font-semibold text-on-surface whitespace-nowrap">
            Chọn API:
          </label>
          <select
            value={selectedApiId}
            onChange={e => handleSelectApi(e.target.value)}
            className="p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-medium outline-none focus:ring-2 focus:ring-primary min-w-[220px]"
          >
            {apis.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Connection / Load Error */}
      {error && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3">
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Stale Documentation Warning Banner (PR #49 / US-09 requirement) */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] mt-0.5">
          warning
        </span>
        <div className="text-body-sm text-on-surface">
          <strong>Lưu ý về tài liệu OpenAPI:</strong> Việc thêm, chỉnh sửa hoặc xóa Endpoint và Phiên bản thủ công tại trang này sẽ khiến tài liệu OpenAPI được trích xuất tự động rơi vào trạng thái cần đồng bộ lại (<em>stale documentation</em>). Vui lòng tái nhập hoặc kiểm tra lại tài liệu khi có thay đổi.
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. VERSIONS MANAGEMENT SECTION                           */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">
              Phiên bản API (Versions)
            </h2>
            <p className="text-body-xs text-on-surface-variant">
              Quản lý các bản phát hành theo định dạng ngữ nghĩa (SemVer: 1.0.0, 1.1.0, 2.0.0).
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon="add"
            onClick={handleOpenCreateVersion}
          >
            Thêm phiên bản mới
          </Button>
        </div>

        {versions.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
            <p className="text-body-sm text-on-surface-variant mb-2">Chưa có phiên bản nào cho API này.</p>
            <Button size="sm" variant="primary" icon="add" onClick={handleOpenCreateVersion}>
              Tạo phiên bản đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {versions.map(v => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code-md font-bold text-primary text-body-md">
                      v{v.version}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-code-sm">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-body-xs text-on-surface-variant line-clamp-2">
                    {v.changelog || 'Chưa có nhật ký thay đổi.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-outline-variant/20">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="edit"
                    onClick={() => handleOpenEditVersion(v)}
                    title="Sửa phiên bản"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    className="text-error hover:bg-error-container/20"
                    onClick={() => setDeleteVersionTarget(v)}
                    title="Xóa phiên bản"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. ENDPOINTS MANAGEMENT SECTION                          */}
      {/* ======================================================== */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">
              Danh sách Tuyến đường (Endpoints)
            </h2>
            <p className="text-body-xs text-on-surface-variant">
              Các phương thức HTTP, đường dẫn routing và cấu trúc tham số đầu vào.
            </p>
          </div>

          <Button
            variant="primary"
            icon="add"
            disabled={versions.length === 0}
            onClick={handleOpenCreateEndpoint}
          >
            Thêm Endpoint Route
          </Button>
        </div>

        {/* Version Filter Tabs */}
        {versions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/20">
            <button
              type="button"
              onClick={() => setSelectedVersionFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold whitespace-nowrap transition-colors ${
                selectedVersionFilter === 'ALL'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Tất cả phiên bản ({endpoints.length})
            </button>
            {versions.map(v => {
              const count = endpoints.filter(e => e.versionId === v.id).length;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVersionFilter(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedVersionFilter === v.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  v{v.version} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Endpoints Table */}
        {loadingDetails ? (
          <div className="space-y-2 animate-pulse" aria-label="Loading endpoints">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-surface-container rounded-xl" />
            ))}
          </div>
        ) : filteredEndpoints.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
            <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
              route
            </span>
            <p className="text-body-sm text-on-surface font-semibold">Chưa có Endpoint nào.</p>
            <p className="text-body-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
              {versions.length === 0
                ? 'Vui lòng tạo phiên bản API trước khi thêm Endpoint.'
                : 'Thêm tuyến đường thủ công hoặc nhập tệp OpenAPI/Swagger để trích xuất tự động.'}
            </p>
            {versions.length > 0 && (
              <Button size="sm" variant="primary" icon="add" onClick={handleOpenCreateEndpoint}>
                Thêm Endpoint mới
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3">Phương thức</th>
                  <th className="px-4 py-3">Đường dẫn Route</th>
                  <th className="px-4 py-3">Phiên bản</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Tham số</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredEndpoints.map(ep => {
                  const ver = versions.find(v => v.id === ep.versionId);
                  const paramCount = ep.parameters?.length || 0;
                  return (
                    <tr key={ep.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="px-4 py-3 font-mono text-primary font-semibold text-body-sm">
                        {ep.path}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral" size="sm">
                          v{ver?.version || ep.versionId}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">
                        {ep.description || 'Không có mô tả'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] bg-surface-container-high px-2 py-0.5 rounded font-mono text-on-surface-variant">
                          {paramCount} params
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="edit"
                            onClick={() => handleOpenEditEndpoint(ep)}
                            title="Sửa Endpoint"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="delete"
                            className="text-error hover:bg-error-container/20"
                            onClick={() => setDeleteEpTarget(ep)}
                            title="Xóa Endpoint"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VERSION MODAL (Create/Edit)                              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => !versionSubmitting && setIsVersionModalOpen(false)}
        title={editingVersion ? 'Chỉnh sửa Phiên bản API' : 'Thêm Phiên bản API mới'}
        description="Định danh phiên bản phát hành theo chuẩn SemVer."
        maxWidth="md"
      >
        <form onSubmit={handleSaveVersion} className="space-y-4">
          {versionError && (
            <div role="alert" className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
              {versionError}
            </div>
          )}

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Mã phiên bản (Version) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: 1.0.0 hoặc 2.1.0-beta"
              value={versionInput}
              onChange={e => setVersionInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-mono outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Nhật ký thay đổi (Changelog)
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú các điểm mới, sửa lỗi hoặc thay đổi API contract..."
              value={changelogInput}
              onChange={e => setChangelogInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={versionSubmitting}
              onClick={() => setIsVersionModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={versionSubmitting}
            >
              {versionSubmitting ? 'Đang lưu...' : editingVersion ? 'Cập nhật' : 'Tạo phiên bản'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Version Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteVersionTarget)}
        onClose={() => !deletingVersion && setDeleteVersionTarget(null)}
        title="Xác nhận xóa phiên bản"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-body-sm text-on-surface">
            Bạn có chắc chắn muốn xóa phiên bản <strong>v{deleteVersionTarget?.version}</strong> không? Các endpoint thuộc phiên bản này có thể bị ảnh hưởng.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={deletingVersion}
              onClick={() => setDeleteVersionTarget(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deletingVersion}
              onClick={handleConfirmDeleteVersion}
            >
              {deletingVersion ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* ENDPOINT MODAL (Create/Edit)                             */}
      {/* ======================================================== */}
      <Modal
        isOpen={isEndpointModalOpen}
        onClose={() => !epSubmitting && setIsEndpointModalOpen(false)}
        title={editingEndpoint ? 'Chỉnh sửa Endpoint Route' : 'Thêm Endpoint Route Mới'}
        description="Định nghĩa phương thức HTTP, route path và schemas dữ liệu."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEndpoint} className="space-y-4">
          {epError && (
            <div role="alert" className="p-3 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
              {epError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Phiên bản <span className="text-error">*</span>
              </label>
              <select
                value={epVersionId}
                onChange={e => setEpVersionId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary font-mono"
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.version}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Phương thức <span className="text-error">*</span>
              </label>
              <select
                value={epMethod}
                onChange={e => setEpMethod(e.target.value as HttpMethod)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary font-mono font-bold"
              >
                {HTTP_METHODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Đường dẫn Path <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="/v1/users/profile"
                value={epPath}
                onChange={e => setEpPath(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm font-mono outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Mô tả tóm tắt
            </label>
            <input
              type="text"
              placeholder="VD: Lấy thông tin hồ sơ người dùng theo token xác thực"
              value={epDescription}
              onChange={e => setEpDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-body-sm font-semibold text-on-surface block mb-1">
              Cấu trúc tham số Parameters (JSON Array)
            </label>
            <textarea
              rows={3}
              value={epParametersJson}
              onChange={e => setEpParametersJson(e.target.value)}
              placeholder='[{"name": "id", "in": "path", "required": true, "type": "string"}]'
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-xs font-mono outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Request Schema (JSON Schema)
              </label>
              <textarea
                rows={4}
                value={epRequestSchemaJson}
                onChange={e => setEpRequestSchemaJson(e.target.value)}
                placeholder='{"type": "object", "properties": {"name": {"type": "string"}}}'
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-xs font-mono outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-body-sm font-semibold text-on-surface block mb-1">
                Phản hồi mẫu Response Example (JSON)
              </label>
              <textarea
                rows={4}
                value={epResponseExampleJson}
                onChange={e => setEpResponseExampleJson(e.target.value)}
                placeholder='{"status": 200, "data": {}}'
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-xs font-mono outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={epSubmitting}
              onClick={() => setIsEndpointModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={epSubmitting}
            >
              {epSubmitting ? 'Đang lưu...' : editingEndpoint ? 'Cập nhật Endpoint' : 'Tạo Endpoint'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Endpoint Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteEpTarget)}
        onClose={() => !deletingEp && setDeleteEpTarget(null)}
        title="Xác nhận xóa Endpoint"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-body-sm text-on-surface">
            Bạn có chắc chắn muốn xóa endpoint <strong>{deleteEpTarget?.method} {deleteEpTarget?.path}</strong> không? Tuyến đường này sẽ bị gỡ bỏ khỏi Gateway.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button
              type="button"
              variant="secondary"
              disabled={deletingEp}
              onClick={() => setDeleteEpTarget(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deletingEp}
              onClick={handleConfirmDeleteEndpoint}
            >
              {deletingEp ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
