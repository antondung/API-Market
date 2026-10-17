import React, { useState } from 'react';
import { MethodBadge, Badge } from '../ui/Badge';
import type { ProviderDocumentation } from '../../services/providerTypes';
import type { HttpMethod } from '../../services/providerTypes';

interface DocumentationViewerProps {
  doc: ProviderDocumentation;
  apiName?: string;
  baseUrl?: string;
}

type SectionKey = 'overview' | 'auth' | 'endpoints' | 'parameters' | 'request' | 'response' | 'errors';

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ doc, apiName, baseUrl }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const content = doc.content || {};
  const info = content.info || {};
  const servers = content.servers || (baseUrl ? [{ url: baseUrl }] : []);
  const paths = content.paths || {};
  const components = content.components || {};
  const securitySchemes = components.securitySchemes || content.securityDefinitions || {};

  // Extract endpoints list from paths
  const extractedEndpoints: Array<{
    path: string;
    method: HttpMethod;
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: any[];
    requestBody?: any;
    responses?: Record<string, any>;
    tags?: string[];
  }> = [];

  for (const [routePath, routeMethods] of Object.entries(paths as Record<string, any>)) {
    if (typeof routeMethods !== 'object' || routeMethods === null) continue;
    for (const [methodKey, methodObj] of Object.entries(routeMethods as Record<string, any>)) {
      const upperMethod = methodKey.toUpperCase();
      if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(upperMethod)) {
        extractedEndpoints.push({
          path: routePath,
          method: upperMethod as HttpMethod,
          summary: methodObj?.summary,
          description: methodObj?.description,
          operationId: methodObj?.operationId,
          parameters: methodObj?.parameters || [],
          requestBody: methodObj?.requestBody,
          responses: methodObj?.responses || {},
          tags: methodObj?.tags || [],
        });
      }
    }
  }

  const sections: { key: SectionKey; label: string; icon: string; count?: number }[] = [
    { key: 'overview', label: '1. Tổng quan (Overview)', icon: 'info' },
    { key: 'auth', label: '2. Xác thực (Authentication)', icon: 'lock', count: Object.keys(securitySchemes).length },
    { key: 'endpoints', label: '3. Tuyến đường (Endpoints)', icon: 'alt_route', count: extractedEndpoints.length },
    { key: 'parameters', label: '4. Tham số (Parameters)', icon: 'tune' },
    { key: 'request', label: '5. Yêu cầu (Request Body)', icon: 'input' },
    { key: 'response', label: '6. Phản hồi (Responses)', icon: 'output' },
    { key: 'errors', label: '7. Mã lỗi (Error Codes)', icon: 'warning' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar Navigation */}
      <nav aria-label="Documentation sections" className="w-full lg:w-64 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3 shrink-0 lg:sticky lg:top-6">
        <div className="text-body-xs font-bold text-on-surface-variant uppercase px-3 py-2">
          7 Mục Chuẩn OpenAPI
        </div>
        <div className="space-y-1">
          {sections.map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-body-sm font-medium transition-colors text-left ${
                activeSection === s.key
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </div>
              {typeof s.count === 'number' && s.count > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                    activeSection === s.key
                      ? 'bg-on-primary/20 text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {s.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 lg:p-8 space-y-6">
        {/* ======================================================== */}
        {/* SECTION 1: OVERVIEW                                      */}
        {/* ======================================================== */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-2 text-primary font-mono text-body-sm mb-1">
                <span>OpenAPI Version: {content.openapi || content.swagger || '3.0.0'}</span>
                <span>•</span>
                <span>API Version: {info.version || '1.0.0'}</span>
              </div>
              <h2 className="text-headline-md font-bold text-on-surface">
                {info.title || apiName || 'API Service'}
              </h2>
              <p className="text-body-md text-on-surface-variant mt-2 whitespace-pre-line">
                {info.description || 'Chưa có mô tả tóm tắt cho tài liệu API này.'}
              </p>
            </div>

            <div>
              <h3 className="text-title-md font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">dns</span>
                Máy chủ Base Servers
              </h3>
              {servers.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">Không có máy chủ nào được khai báo.</p>
              ) : (
                <div className="space-y-2">
                  {servers.map((srv: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between"
                    >
                      <span className="font-mono text-primary font-semibold text-body-sm">
                        {srv.url}
                      </span>
                      {srv.description && (
                        <span className="text-body-xs text-on-surface-variant">{srv.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {info.contact && (
              <div className="pt-4 border-t border-outline-variant/20 text-body-xs text-on-surface-variant space-y-1">
                <div className="font-semibold text-on-surface">Thông tin liên hệ kỹ thuật:</div>
                {info.contact.name && <div>Người đại diện: {info.contact.name}</div>}
                {info.contact.email && <div>Email: {info.contact.email}</div>}
                {info.contact.url && <div>URL: {info.contact.url}</div>}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: AUTHENTICATION                                */}
        {/* ======================================================== */}
        {activeSection === 'auth' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Cơ chế Xác thực (Authentication)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Các phương thức bảo mật bắt buộc khi gọi API thông qua API Gateway.
              </p>
            </div>

            {Object.keys(securitySchemes).length === 0 ? (
              <div className="p-6 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <p className="text-body-sm text-on-surface-variant">
                  Tài liệu không chỉ định Security Schemes riêng. Mặc định API Gateway sử dụng API Key trong header <code>X-API-Key</code> hoặc Bearer JWT Token.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(securitySchemes).map(([schemeName, scheme]: [string, any]) => (
                  <div key={schemeName} className="p-5 rounded-xl border border-outline-variant/30 bg-surface-container space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary text-body-md">{schemeName}</span>
                      <Badge variant="neutral">{scheme.type || 'apiKey'}</Badge>
                    </div>
                    {scheme.description && (
                      <p className="text-body-sm text-on-surface-variant">{scheme.description}</p>
                    )}
                    <div className="text-body-xs font-mono bg-surface-container-high p-3 rounded-lg text-on-surface space-y-1">
                      {scheme.in && <div>Vị trí truyền: <strong>{scheme.in}</strong></div>}
                      {scheme.name && <div>Tên Header/Tham số: <strong>{scheme.name}</strong></div>}
                      {scheme.scheme && <div>Định dạng scheme: <strong>{scheme.scheme}</strong></div>}
                      {scheme.bearerFormat && <div>Bearer format: <strong>{scheme.bearerFormat}</strong></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: ENDPOINTS                                     */}
        {/* ======================================================== */}
        {activeSection === 'endpoints' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Danh sách Tuyến đường (Endpoints)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Toàn bộ {extractedEndpoints.length} thao tác HTTP được khai báo trong OpenAPI specification.
              </p>
            </div>

            {extractedEndpoints.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <p className="text-body-sm text-on-surface-variant">Không tìm thấy Endpoint nào trong đặc tả này.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {extractedEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container hover:border-primary/40 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 font-mono">
                        <MethodBadge method={ep.method} />
                        <span className="font-bold text-on-surface text-body-sm">{ep.path}</span>
                      </div>
                      {ep.tags && ep.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {ep.tags.map(t => (
                            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {ep.summary && (
                      <p className="text-body-sm text-on-surface font-medium">{ep.summary}</p>
                    )}
                    {ep.description && ep.description !== ep.summary && (
                      <p className="text-body-xs text-on-surface-variant">{ep.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: PARAMETERS                                    */}
        {/* ======================================================== */}
        {activeSection === 'parameters' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Cấu trúc Tham số (Parameters)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Chi tiết các tham số Query, Path và Header trên từng tuyến đường.
              </p>
            </div>

            {extractedEndpoints.filter(e => e.parameters && e.parameters.length > 0).length === 0 ? (
              <div className="p-8 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <p className="text-body-sm text-on-surface-variant">Không có tham số nào được định nghĩa.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {extractedEndpoints
                  .filter(e => e.parameters && e.parameters.length > 0)
                  .map((ep, idx) => (
                    <div key={idx} className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container">
                      <div className="p-3 bg-surface-container-high flex items-center gap-2 font-mono text-body-xs border-b border-outline-variant/20">
                        <MethodBadge method={ep.method} />
                        <span className="font-semibold text-on-surface">{ep.path}</span>
                      </div>
                      <table className="w-full text-left text-body-xs">
                        <thead className="bg-surface-container text-on-surface-variant uppercase text-[10px] border-b border-outline-variant/10">
                          <tr>
                            <th className="px-4 py-2">Tên</th>
                            <th className="px-4 py-2">Vị trí</th>
                            <th className="px-4 py-2">Kiểu</th>
                            <th className="px-4 py-2">Bắt buộc</th>
                            <th className="px-4 py-2">Mô tả</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 font-mono">
                          {ep.parameters!.map((param: any, pIdx: number) => (
                            <tr key={pIdx}>
                              <td className="px-4 py-2 font-bold text-primary">{param.name}</td>
                              <td className="px-4 py-2 text-on-surface-variant">{param.in}</td>
                              <td className="px-4 py-2 text-on-surface-variant">{param.schema?.type || param.type || 'string'}</td>
                              <td className="px-4 py-2">
                                {param.required ? (
                                  <span className="text-error font-semibold font-sans">Bắt buộc</span>
                                ) : (
                                  <span className="text-outline font-sans">Tùy chọn</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-on-surface font-sans">{param.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 5: REQUEST BODY                                  */}
        {/* ======================================================== */}
        {activeSection === 'request' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Cấu trúc Yêu cầu (Request Body)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Định dạng payload gửi lên trong các phương thức POST, PUT, PATCH.
              </p>
            </div>

            {extractedEndpoints.filter(e => e.requestBody).length === 0 ? (
              <div className="p-8 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <p className="text-body-sm text-on-surface-variant">Không có thao tác nào yêu cầu Request Body.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {extractedEndpoints
                  .filter(e => e.requestBody)
                  .map((ep, idx) => (
                    <div key={idx} className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container space-y-3">
                      <div className="flex items-center gap-2 font-mono text-body-xs">
                        <MethodBadge method={ep.method} />
                        <span className="font-semibold text-on-surface">{ep.path}</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-surface-container-high text-on-surface font-mono text-body-xs overflow-x-auto max-h-60">
                        {JSON.stringify(ep.requestBody, null, 2)}
                      </pre>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 6: RESPONSES                                     */}
        {/* ======================================================== */}
        {activeSection === 'response' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Cấu trúc Phản hồi (Responses)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Các mã trạng thái HTTP (200, 201, 204...) và schema dữ liệu trả về tương ứng.
              </p>
            </div>

            {extractedEndpoints.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container">
                <p className="text-body-sm text-on-surface-variant">Không có phản hồi nào được định nghĩa.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {extractedEndpoints.map((ep, idx) => (
                  <div key={idx} className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container space-y-3">
                    <div className="flex items-center gap-2 font-mono text-body-xs">
                      <MethodBadge method={ep.method} />
                      <span className="font-semibold text-on-surface">{ep.path}</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(ep.responses || {}).map(([statusCode, resObj]: [string, any]) => (
                        <div key={statusCode} className="p-3 rounded-lg bg-surface-container-high border border-outline-variant/20 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold text-body-xs px-2 py-0.5 rounded ${
                                statusCode.startsWith('2')
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : statusCode.startsWith('4')
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                  : 'bg-error-container/40 text-error'
                              }`}
                            >
                              HTTP {statusCode}
                            </span>
                            <span className="text-body-xs text-on-surface font-medium">{resObj?.description || 'Response'}</span>
                          </div>
                          {resObj?.content && (
                            <pre className="mt-2 text-[11px] font-mono p-2 rounded bg-surface text-on-surface overflow-x-auto max-h-40">
                              {JSON.stringify(resObj.content, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 7: ERRORS                                        */}
        {/* ======================================================== */}
        {activeSection === 'errors' && (
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="text-headline-md font-bold text-on-surface">Mã Lỗi Tiêu chuẩn (Error Codes)</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Các mã lỗi trả về khi yêu cầu vi phạm chính sách xác thực, vượt giới hạn tần suất hoặc cấu trúc dữ liệu không hợp lệ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-error/30 bg-error-container/10 space-y-2">
                <span className="font-mono font-bold text-error text-body-sm">400 Bad Request</span>
                <p className="text-body-xs text-on-surface">Tham số hoặc cấu trúc JSON trong Request Body không đúng định dạng Schema quy định.</p>
              </div>

              <div className="p-4 rounded-xl border border-error/30 bg-error-container/10 space-y-2">
                <span className="font-mono font-bold text-error text-body-sm">401 Unauthorized</span>
                <p className="text-body-xs text-on-surface">Thiếu hoặc API Key / JWT Token không hợp lệ. Hãy kiểm tra header xác thực.</p>
              </div>

              <div className="p-4 rounded-xl border border-error/30 bg-error-container/10 space-y-2">
                <span className="font-mono font-bold text-error text-body-sm">403 Forbidden</span>
                <p className="text-body-xs text-on-surface">Gói đăng ký của người dùng chưa kích hoạt hoặc không đủ quyền hạn truy cập tuyến đường này.</p>
              </div>

              <div className="p-4 rounded-xl border border-error/30 bg-error-container/10 space-y-2">
                <span className="font-mono font-bold text-error text-body-sm">429 Too Many Requests</span>
                <p className="text-body-xs text-on-surface">Vượt quá giới hạn Rate Limit (RPS) hoặc Quota hàng tháng của gói định giá.</p>
              </div>

              <div className="p-4 rounded-xl border border-error/30 bg-error-container/10 space-y-2">
                <span className="font-mono font-bold text-error text-body-sm">502 / 504 Bad Gateway / Gateway Timeout</span>
                <p className="text-body-xs text-on-surface">Máy chủ Upstream của nhà cung cấp không phản hồi kịp thời qua Gateway.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
