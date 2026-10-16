BEGIN;

-- Dữ liệu chỉ dùng cho môi trường development/demo. Chạy qua: npm run db:seed

INSERT INTO users (name, email, password_hash, role_id)
VALUES
    ('Demo Provider Two', 'provider2@example.com', crypt('Provider2@123', gen_salt('bf', 12)), (SELECT id FROM roles WHERE name = 'API_PROVIDER')),
    ('Demo Admin Two', 'admin2@example.com', crypt('Admin2@123', gen_salt('bf', 12)), (SELECT id FROM roles WHERE name = 'ADMIN'))
ON CONFLICT (email_normalized) DO NOTHING;

INSERT INTO api_providers (user_id, provider_name, endpoint_url, description)
SELECT u.id, 'Demo Provider Two', 'http://localhost:4012', 'Nhà cung cấp thứ hai dùng cho dữ liệu demo Sprint 2'
FROM users u
WHERE u.email_normalized = 'provider2@example.com'
  AND NOT EXISTS (SELECT 1 FROM api_providers ap WHERE ap.user_id = u.id);

INSERT INTO agreements (version, content, is_active)
VALUES ('2026-10', 'Provider xác nhận có quyền phân phối API, cung cấp thông tin chính xác và tuân thủ chính sách của API Market.', TRUE)
ON CONFLICT (version) DO UPDATE SET content = EXCLUDED.content;

WITH demo_provider AS (
    SELECT id FROM api_providers WHERE user_id = (SELECT id FROM users WHERE email_normalized = 'provider@example.com')
), demo_admin AS (
    SELECT id FROM users WHERE email_normalized = 'admin@example.com'
)
INSERT INTO provider_verifications (provider_id, organization_name, contact_email, evidence_urls, status, reviewed_at, reviewed_by)
SELECT dp.id, 'Demo API Provider Co., Ltd.', 'provider@example.com', '["https://example.com/documents/demo-provider-license.pdf"]'::jsonb, 'Verified', CURRENT_TIMESTAMP, da.id
FROM demo_provider dp CROSS JOIN demo_admin da
WHERE NOT EXISTS (SELECT 1 FROM provider_verifications pv WHERE pv.provider_id = dp.id AND pv.status = 'Verified');

WITH demo_provider AS (
    SELECT id FROM api_providers WHERE user_id = (SELECT id FROM users WHERE email_normalized = 'provider2@example.com')
), demo_admin AS (
    SELECT id FROM users WHERE email_normalized = 'admin@example.com'
)
INSERT INTO provider_verifications (provider_id, organization_name, contact_email, evidence_urls, status, reviewed_at, reviewed_by)
SELECT dp.id, 'Demo Provider Two JSC', 'provider2@example.com', '["https://example.com/documents/demo-provider-two-license.pdf"]'::jsonb, 'Verified', CURRENT_TIMESTAMP, da.id
FROM demo_provider dp CROSS JOIN demo_admin da
WHERE NOT EXISTS (SELECT 1 FROM provider_verifications pv WHERE pv.provider_id = dp.id AND pv.status = 'Verified');

INSERT INTO apis (provider_id, name, description, category, base_url, tags)
SELECT ap.id, 'Weather Now API', 'Dự báo thời tiết hiện tại và dự báo ngắn hạn cho thành phố.', 'Weather', 'http://localhost:4011', '["weather", "forecast", "demo"]'::jsonb
FROM api_providers ap JOIN users u ON u.id = ap.user_id
WHERE u.email_normalized = 'provider@example.com'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO apis (provider_id, name, description, category, base_url, tags)
SELECT ap.id, 'Currency Rates API', 'Tỷ giá tham khảo giữa các loại tiền tệ phổ biến.', 'Finance', 'http://localhost:4012', '["currency", "exchange-rate", "demo"]'::jsonb
FROM api_providers ap JOIN users u ON u.id = ap.user_id
WHERE u.email_normalized = 'provider2@example.com'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO apis (provider_id, name, description, category, base_url, tags)
SELECT ap.id, 'Product Catalog API', 'Danh mục sản phẩm mẫu cho ứng dụng thương mại điện tử.', 'Commerce', 'http://localhost:4013', '["product", "catalog", "demo"]'::jsonb
FROM api_providers ap JOIN users u ON u.id = ap.user_id
WHERE u.email_normalized = 'provider@example.com'
ON CONFLICT (provider_id, name) DO NOTHING;

INSERT INTO api_versions (api_id, version, changelog)
SELECT id, 'v1', 'Phiên bản demo đầu tiên.' FROM apis
WHERE name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API')
ON CONFLICT (api_id, version) DO NOTHING;

INSERT INTO api_endpoints (api_id, version_id, method, path, description, parameters, response_example)
SELECT a.id, v.id, 'GET', '/v1/weather', 'Lấy thời tiết theo tên thành phố.', '[{"name":"city","in":"query","type":"string","required":true,"description":"Tên thành phố"}]'::jsonb, '{"city":"Ho Chi Minh City","temperatureC":31,"condition":"Partly cloudy"}'::jsonb
FROM apis a JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1' WHERE a.name = 'Weather Now API'
ON CONFLICT (version_id, method, path) DO NOTHING;

INSERT INTO api_endpoints (api_id, version_id, method, path, description, parameters, response_example)
SELECT a.id, v.id, 'GET', '/v1/rates', 'Lấy tỷ giá theo đồng tiền cơ sở.', '[{"name":"base","in":"query","type":"string","required":false,"description":"Mã tiền tệ ISO 4217"}]'::jsonb, '{"base":"VND","rates":{"USD":0.000039,"EUR":0.000036}}'::jsonb
FROM apis a JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1' WHERE a.name = 'Currency Rates API'
ON CONFLICT (version_id, method, path) DO NOTHING;

INSERT INTO api_endpoints (api_id, version_id, method, path, description, parameters, response_example)
SELECT a.id, v.id, 'GET', '/v1/products', 'Lấy danh sách sản phẩm mẫu.', '[]'::jsonb, '{"items":[{"id":"p-001","name":"Wireless Keyboard","price":490000}]}'::jsonb
FROM apis a JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1' WHERE a.name = 'Product Catalog API'
ON CONFLICT (version_id, method, path) DO NOTHING;

INSERT INTO api_documentations (api_id, version_id, source, content)
SELECT a.id, v.id, 'OPENAPI_IMPORT', jsonb_build_object('openapi', '3.0.3', 'info', jsonb_build_object('title', a.name, 'version', v.version), 'servers', jsonb_build_array(jsonb_build_object('url', a.base_url)))
FROM apis a JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1'
WHERE a.name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API')
ON CONFLICT (version_id) DO NOTHING;

INSERT INTO api_plans (api_id, name, price_monthly, currency, quota, rate_limit)
SELECT a.id, p.name, p.price_monthly, 'VND', p.quota, p.rate_limit
FROM apis a CROSS JOIN (VALUES ('Free'::varchar, 0::numeric, 1000::bigint, 10), ('Basic'::varchar, 99000::numeric, 10000::bigint, 50), ('Pro'::varchar, 299000::numeric, 100000::bigint, 200)) AS p(name, price_monthly, quota, rate_limit)
WHERE a.name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API')
ON CONFLICT (api_id, name) DO NOTHING;

INSERT INTO api_legal_declarations (api_id, agreement_id, ownership_declaration, distribution_rights, data_classification)
SELECT a.id, ag.id, 'Tôi xác nhận có quyền cung cấp API và dữ liệu mẫu này.', 'Cho phép API Market phân phối API theo điều khoản đã chấp nhận.', 'Public'
FROM apis a CROSS JOIN agreements ag
WHERE ag.version = '2026-10'
  AND a.name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API')
ON CONFLICT (api_id) DO NOTHING;

-- Ba trạng thái minh họa cho màn hình Provider/Admin: chờ duyệt, đang duyệt và đã xuất bản.
UPDATE apis SET status = 'Submitted'
WHERE name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API') AND status = 'Draft';

UPDATE apis SET status = 'Under Review'
WHERE name IN ('Currency Rates API', 'Product Catalog API') AND status = 'Submitted';

UPDATE apis SET status = 'Approved'
WHERE name = 'Product Catalog API' AND status = 'Under Review';

UPDATE apis SET status = 'Published'
WHERE name = 'Product Catalog API' AND status = 'Approved';

INSERT INTO api_reviews (api_id, reviewer_id, from_status, to_status, reason)
SELECT a.id, u.id, review.from_status, review.to_status, review.reason
FROM users u
CROSS JOIN (VALUES
    ('Currency Rates API', 'Submitted'::varchar, 'Under Review'::varchar, NULL::text),
    ('Product Catalog API', 'Submitted'::varchar, 'Under Review'::varchar, NULL::text),
    ('Product Catalog API', 'Under Review'::varchar, 'Approved'::varchar, 'API mẫu đạt yêu cầu demo.'),
    ('Product Catalog API', 'Approved'::varchar, 'Published'::varchar, 'Xuất bản để demo marketplace.')
) AS review(api_name, from_status, to_status, reason)
JOIN apis a ON a.name = review.api_name
WHERE u.email_normalized = 'admin@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM api_reviews ar
      WHERE ar.api_id = a.id AND ar.from_status = review.from_status AND ar.to_status = review.to_status
  );

INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, detail)
SELECT u.id, 'ADMIN', 'DEMO_DATA_SEEDED', 'API', a.id::text, jsonb_build_object('source', '004_seed_provider_demo_data.sql')
FROM users u CROSS JOIN apis a
WHERE u.email_normalized = 'admin@example.com'
  AND a.name IN ('Weather Now API', 'Currency Rates API', 'Product Catalog API')
  AND NOT EXISTS (
      SELECT 1 FROM audit_logs al
      WHERE al.action = 'DEMO_DATA_SEEDED' AND al.target_type = 'API' AND al.target_id = a.id::text
  );

COMMIT;
