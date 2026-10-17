import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../i18n';
import { DocumentationViewer } from '../../components/provider/DocumentationViewer';
import {
  listProviderApis,
  listProviderVersions,
  importOpenApiFile,
  listProviderDocumentation,
  formatProviderErrorMessage,
} from '../../services/providerApi';
import type {
  ProviderApi,
  ProviderVersion,
  ProviderDocumentation,
  OpenApiImportResult,
} from '../../services/providerTypes';

const MAX_FILE_SIZE = 1048576; // 1MB

export const OpenApiImportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryApiId = searchParams.get('api');
  const queryTab = searchParams.get('tab') === 'viewer' ? 'viewer' : 'import';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'import' | 'viewer'>(queryTab);

  // APIs data
  const [apis, setApis] = useState<ProviderApi[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>(queryApiId || '');
  const [loadingApis, setLoadingApis] = useState(true);

  // Versions data
  const [versions, setVersions] = useState<ProviderVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Import form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<OpenApiImportResult | null>(null);

  // Documentation data
  const [documentations, setDocumentations] = useState<ProviderDocumentation[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  // Global error & retry
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // 1. Fetch APIs list on mount
  useEffect(() => {
    const controller = new AbortController();
    setLoadingApis(true);
    setGlobalError(null);

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
          setGlobalError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingApis(false);
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  // Sync query params
  const handleSelectApi = (apiId: string) => {
    setSelectedApiId(apiId);
    setSearchParams({ api: apiId, tab: activeTab });
  };

  const handleTabChange = (tab: 'import' | 'viewer') => {
    setActiveTab(tab);
    setSearchParams({ api: selectedApiId, tab });
  };

  // 2. Fetch Versions when API selected
  useEffect(() => {
    if (!selectedApiId) return;

    const controller = new AbortController();
    setLoadingVersions(true);
    listProviderVersions(selectedApiId, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          setVersions(res || []);
          if (res && res.length > 0) {
            setSelectedVersionId(res[0].id);
          } else {
            setSelectedVersionId('');
          }
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setUploadError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingVersions(false);
        }
      });

    return () => controller.abort();
  }, [selectedApiId, retryKey]);

  // 3. Fetch Documentation when in viewer tab or when selectedApiId changes
  useEffect(() => {
    if (!selectedApiId) return;

    const controller = new AbortController();
    setLoadingDocs(true);
    setDocError(null);

    listProviderDocumentation(selectedApiId, controller.signal)
      .then(res => {
        if (!controller.signal.aborted) {
          setDocumentations(res || []);
          setSelectedDocIndex(0);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setDocError(formatProviderErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDocs(false);
        }
      });

    return () => controller.abort();
  }, [selectedApiId, activeTab, retryKey]);

  const selectedApi = apis.find(a => a.id === selectedApiId);

  // File selection validation
  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    setImportResult(null);

    const validExtensions = ['.json', '.yaml', '.yml'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setUploadError('Tệp tải lên phải có định dạng OpenAPI JSON (.json) hoặc YAML (.yaml, .yml).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`Kích thước tệp (${(file.size / 1024).toFixed(1)} KB) vượt quá giới hạn tối đa cho phép là 1MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Upload & Import handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiId || !selectedVersionId || !selectedFile || uploading) return;

    setUploading(true);
    setUploadError(null);
    setImportResult(null);

    try {
      const result = await importOpenApiFile(selectedApiId, selectedVersionId, selectedFile);
      setImportResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh documentation in background
      listProviderDocumentation(selectedApiId).then(docs => {
        setDocumentations(docs || []);
      });
    } catch (err) {
      setUploadError(formatProviderErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loadingApis) {
    return (
      <div className="space-y-6 animate-pulse" aria-label="Loading OpenAPI page">
        <div className="h-20 bg-surface-container-high rounded-2xl" />
        <div className="h-96 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (apis.length === 0) {
    return (
      <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-xl mx-auto my-12">
        <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">file_upload</span>
        <h3 className="text-headline-sm font-bold text-on-surface">{t('No APIs in Portfolio')}</h3>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
          {t('Create an API first before importing OpenAPI / Swagger documentation.')}
        </p>
        <Button variant="primary" icon="add" onClick={() => navigate('/provider/create-api')}>
          {t('Create Your First API')}
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
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t('OpenAPI / Swagger Auto-Documentation Workspace')}
          </h1>
          <p className="text-body-md text-on-surface-variant">
            {t('Upload standard OpenAPI 3.0+ JSON/YAML to extract routes, schemas, and live documentation.')}
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

      {/* Global Error Banner */}
      {globalError && (
        <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3">
          <span>{globalError}</span>
          <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Navigation Tabs (Import vs 7-Section Viewer) */}
      <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-body-sm transition-colors ${
            activeTab === 'import'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>Tải lên OpenAPI (Import)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('viewer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-body-sm transition-colors ${
            activeTab === 'viewer'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Xem tài liệu 7 mục (Viewer)</span>
          {documentations.length > 0 && (
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'viewer'
                  ? 'bg-on-primary/20 text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {documentations.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OPENAPI FILE IMPORT WORKSPACE                     */}
      {/* ======================================================== */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-headline-sm font-bold text-on-surface">
                  Tải lên tệp tài liệu OpenAPI / Swagger
                </h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Hỗ trợ chuẩn OpenAPI 3.0.x và 3.1.x định dạng JSON hoặc YAML (dung lượng tối đa 1MB).
                </p>
              </div>

              {uploadError && (
                <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error text-body-sm">
                  {uploadError}
                </div>
              )}

              {importResult && (
                <div role="status" className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-body-md text-emerald-700 dark:text-emerald-300">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Trích xuất tài liệu OpenAPI thành công!</span>
                  </div>
                  <div className="text-body-sm space-y-1 pl-7">
                    <div>Tiêu đề API: <strong>{importResult.title}</strong></div>
                    <div>Số lượng Endpoint đã trích xuất: <strong>{importResult.endpointCount}</strong> tuyến đường.</div>
                    <div>Liên kết tới phiên bản: <strong>v{versions.find(v => v.id === importResult.versionId)?.version || importResult.versionId}</strong></div>
                  </div>
                  <div className="pt-3 pl-7 flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="primary"
                      icon="menu_book"
                      onClick={() => handleTabChange('viewer')}
                    >
                      Xem tài liệu 7 mục ngay
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon="alt_route"
                      onClick={() => navigate(`/provider/endpoints?api=${selectedApiId}`)}
                    >
                      Xem danh sách Endpoint
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Version Selector */}
                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1.5">
                    Gán vào phiên bản API (Version) <span className="text-error">*</span>
                  </label>
                  {loadingVersions ? (
                    <div className="h-10 bg-surface-container rounded-xl animate-pulse" />
                  ) : versions.length === 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-body-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                      <span>API này chưa có phiên bản nào để nhập tài liệu.</span>
                      <Link to={`/provider/endpoints?api=${selectedApiId}`} className="font-semibold underline">
                        Tạo phiên bản trước
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedVersionId}
                      onChange={e => setSelectedVersionId(e.target.value)}
                      className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-body-sm outline-none focus:ring-2 focus:ring-primary font-mono"
                    >
                      {versions.map(v => (
                        <option key={v.id} value={v.id}>
                          v{v.version} ({v.changelog || 'Không có changelog'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Drag and drop upload zone */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : selectedFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-outline-variant/50 hover:border-primary/50 bg-surface-container'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.yaml,.yml,application/json,application/x-yaml,text/yaml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span
                    className={`material-symbols-outlined text-[48px] mb-2 block ${
                      selectedFile ? 'text-emerald-500' : 'text-outline'
                    }`}
                  >
                    {selectedFile ? 'task' : 'cloud_upload'}
                  </span>

                  {selectedFile ? (
                    <div>
                      <p className="text-body-md font-bold text-on-surface">{selectedFile.name}</p>
                      <p className="text-body-xs text-on-surface-variant mt-1">
                        Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB • Nhấn để chọn tệp khác
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-body-sm font-bold text-on-surface">
                        Kéo thả tệp OpenAPI vào đây, hoặc nhấn để duyệt tệp
                      </p>
                      <p className="text-body-xs text-on-surface-variant mt-1">
                        Chấp nhận .json, .yaml, .yml (tối đa 1MB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-body-xs text-on-surface-variant">
                    Dữ liệu được kiểm tra cú pháp và tải lên qua multipart/form-data.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!selectedFile || !selectedVersionId || uploading}
                    icon={uploading ? undefined : 'publish'}
                  >
                    {uploading ? 'Đang trích xuất...' : 'Bắt đầu Tải lên & Trích xuất'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right column: Instructions & Rules */}
          <div className="space-y-4">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">help</span>
                Quy định OpenAPI & Chuẩn tài liệu
              </h3>

              <div className="text-body-xs text-on-surface-variant space-y-2 leading-relaxed">
                <p>
                  <strong>1. Chuẩn OpenAPI:</strong> Hệ thống tương thích với các đặc tả OpenAPI 3.0.0, 3.0.3, 3.1.0 và Swagger 2.0.
                </p>
                <p>
                  <strong>2. Tự động hóa:</strong> Toàn bộ các tuyến đường (paths), phương thức HTTP, cấu trúc tham số (parameters) và schema phản hồi sẽ được tự động trích xuất và tạo endpoint route.
                </p>
                <p>
                  <strong>3. Giới hạn dung lượng:</strong> Tệp tài liệu không được vượt quá 1MB theo quy định bảo mật tại Gateway.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] mt-0.5">
                info
              </span>
              <p className="text-body-xs text-on-surface">
                Sau khi tải lên thành công, tài liệu 7 mục sẽ được tạo mới và đánh dấu phiên bản đồng bộ tại tab <strong>Xem tài liệu 7 mục</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 7-SECTION DOCUMENTATION VIEWER                     */}
      {/* ======================================================== */}
      {activeTab === 'viewer' && (
        <div className="space-y-4">
          {docError && (
            <div role="alert" className="p-4 rounded-xl border border-error/30 bg-error-container/20 text-error flex items-center justify-between gap-3">
              <span>{docError}</span>
              <Button size="sm" variant="secondary" onClick={() => setRetryKey(k => k + 1)}>
                Thử lại
              </Button>
            </div>
          )}

          {loadingDocs ? (
            <div className="space-y-6 animate-pulse" aria-label="Loading documentation">
              <div className="h-16 bg-surface-container rounded-2xl" />
              <div className="h-96 bg-surface-container rounded-2xl" />
            </div>
          ) : documentations.length === 0 ? (
            <div className="bg-surface-container-low border border-dashed border-outline-variant/40 rounded-2xl p-16 text-center max-w-xl mx-auto my-8">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">
                library_books
              </span>
              <h3 className="text-headline-sm font-bold text-on-surface">Chưa có tài liệu OpenAPI</h3>
              <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto mb-6">
                Chưa có bản ghi tài liệu nào được trích xuất cho API <strong>{selectedApi?.name}</strong>. Vui lòng tải lên tệp OpenAPI ở tab bên cạnh.
              </p>
              <Button
                variant="primary"
                icon="upload_file"
                onClick={() => handleTabChange('import')}
              >
                Chuyển đến Tải lên OpenAPI
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* If multiple documentation versions exist */}
              {documentations.length > 1 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
                  <span className="text-body-xs font-semibold text-on-surface">Bản ghi tài liệu:</span>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {documentations.map((d, idx) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDocIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-body-xs font-mono transition-colors ${
                          selectedDocIndex === idx
                            ? 'bg-primary text-on-primary font-bold'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        Bản #{idx + 1} ({d.source || 'OpenAPI'})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7-Section Viewer Component */}
              <DocumentationViewer
                doc={documentations[selectedDocIndex] || documentations[0]}
                apiName={selectedApi?.name}
                baseUrl={selectedApi?.baseUrl}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
