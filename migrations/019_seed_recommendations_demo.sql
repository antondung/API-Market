BEGIN;

-- Development/demo seed only. Never runs in NODE_ENV=production.
-- Adds comparable Commerce APIs from provider2@example.com with promotional deals
-- and pre-aggregated provider quality telemetry without modifying usage_logs or transactions.
-- Runs only when 004_seed_provider_demo_data.sql was applied in the same migration transaction,
-- preserving pre-existing Sprint 3/4 upgrade snapshots in sprint4-upgrade.test.ts.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM backend_schema_migrations
        WHERE name = '004_seed_provider_demo_data.sql'
          AND applied_at = CURRENT_TIMESTAMP
    ) THEN

        INSERT INTO apis (provider_id, name, description, category, base_url, tags)
        SELECT ap.id,
               'Smart Commerce Catalog Pro API',
               'API danh mục sản phẩm tối ưu tốc độ cao, tích hợp tìm kiếm ngữ nghĩa và SLA 99.8%.',
               'Commerce',
               'http://localhost:4013',
               '["product", "catalog", "commerce", "deal"]'::jsonb
        FROM api_providers ap
        JOIN users u ON u.id = ap.user_id
        WHERE u.email_normalized = 'provider2@example.com'
        ON CONFLICT (provider_id, name) DO NOTHING;

        INSERT INTO apis (provider_id, name, description, category, base_url, tags)
        SELECT ap.id,
               'OmniRetail Inventory & Catalog API',
               'Giải pháp đồng bộ tồn kho và danh mục thương mại điện tử độ trễ thấp, độ tin cậy cao.',
               'Commerce',
               'http://localhost:4013',
               '["product", "inventory", "catalog"]'::jsonb
        FROM api_providers ap
        JOIN users u ON u.id = ap.user_id
        WHERE u.email_normalized = 'provider2@example.com'
        ON CONFLICT (provider_id, name) DO NOTHING;

        INSERT INTO api_versions (api_id, version, changelog)
        SELECT id, 'v1', 'Phiên bản đầu tiên hỗ trợ tìm kiếm danh mục tốc độ cao.'
        FROM apis
        WHERE name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
        ON CONFLICT (api_id, version) DO NOTHING;

        INSERT INTO api_endpoints (api_id, version_id, method, path, description, parameters, response_example)
        SELECT a.id, v.id, 'GET', '/v1/products',
               'Lấy danh sách sản phẩm đã tối ưu bộ nhớ đệm.',
               '[{"name":"limit","in":"query","type":"integer","required":false,"description":"Số bản ghi tối đa"}]'::jsonb,
               '{"items":[{"id":"sp-001","name":"Mechanical Keyboard Pro","price":450000,"stock":120}]}'::jsonb
        FROM apis a
        JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1'
        WHERE a.name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
        ON CONFLICT (version_id, method, path) DO NOTHING;

        INSERT INTO api_endpoints (api_id, version_id, method, path, description, parameters, response_example)
        SELECT a.id, v.id, 'GET', '/v1/catalog/search',
               'Tìm kiếm nhanh sản phẩm theo từ khóa và danh mục.',
               '[{"name":"q","in":"query","type":"string","required":true,"description":"Từ khóa tìm kiếm"}]'::jsonb,
               '{"total":1,"items":[{"id":"sp-001","name":"Mechanical Keyboard Pro"}]}'::jsonb
        FROM apis a
        JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1'
        WHERE a.name = 'Smart Commerce Catalog Pro API'
        ON CONFLICT (version_id, method, path) DO NOTHING;

        INSERT INTO api_documentations (api_id, version_id, source, content)
        SELECT a.id, v.id, 'OPENAPI_IMPORT',
               jsonb_build_object(
                   'openapi', '3.0.3',
                   'info', jsonb_build_object('title', a.name, 'version', v.version),
                   'servers', jsonb_build_array(jsonb_build_object('url', a.base_url))
               )
        FROM apis a
        JOIN api_versions v ON v.api_id = a.id AND v.version = 'v1'
        WHERE a.name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
        ON CONFLICT (version_id) DO NOTHING;

        INSERT INTO api_plans (api_id, name, price_monthly, currency, quota, rate_limit)
        SELECT a.id, p.name, p.price_monthly, 'VND', p.quota, p.rate_limit
        FROM apis a
        CROSS JOIN (VALUES
            ('Free'::varchar, 0::numeric, 2500::bigint, 30),
            ('Basic'::varchar, 69000::numeric, 20000::bigint, 120),
            ('Pro'::varchar, 199000::numeric, 150000::bigint, 400)
        ) AS p(name, price_monthly, quota, rate_limit)
        WHERE a.name = 'Smart Commerce Catalog Pro API'
        ON CONFLICT (api_id, name) DO NOTHING;

        INSERT INTO api_plans (api_id, name, price_monthly, currency, quota, rate_limit)
        SELECT a.id, p.name, p.price_monthly, 'VND', p.quota, p.rate_limit
        FROM apis a
        CROSS JOIN (VALUES
            ('Free'::varchar, 0::numeric, 2000::bigint, 25),
            ('Basic'::varchar, 79000::numeric, 18000::bigint, 100),
            ('Pro'::varchar, 229000::numeric, 120000::bigint, 350)
        ) AS p(name, price_monthly, quota, rate_limit)
        WHERE a.name = 'OmniRetail Inventory & Catalog API'
        ON CONFLICT (api_id, name) DO NOTHING;

        INSERT INTO api_legal_declarations (
            api_id, agreement_id, ownership_declaration, distribution_rights,
            data_classification, processes_personal_data
        )
        SELECT a.id, ag.id,
               'Tôi xác nhận sở hữu hợp pháp và chịu trách nhiệm về chất lượng API này.',
               'Cho phép phân phối công khai trên API Market theo thỏa thuận hiện hành.',
               'Public',
               FALSE
        FROM apis a
        CROSS JOIN LATERAL (
            SELECT id FROM agreements WHERE is_active = TRUE ORDER BY id DESC LIMIT 1
        ) ag
        WHERE a.name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
        ON CONFLICT (api_id) DO NOTHING;

        -- Transition sequentially through Draft -> Submitted -> Under Review -> Approved -> Published
        UPDATE apis SET status = 'Submitted'
        WHERE name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
          AND status = 'Draft';

        UPDATE apis SET status = 'Under Review'
        WHERE name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
          AND status = 'Submitted';

        UPDATE apis SET status = 'Approved'
        WHERE name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
          AND status = 'Under Review';

        UPDATE apis SET status = 'Published'
        WHERE name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
          AND status = 'Approved';

        INSERT INTO api_reviews (api_id, reviewer_id, from_status, to_status, reason)
        SELECT a.id, u.id, review.from_status, review.to_status, review.reason
        FROM users u
        CROSS JOIN (VALUES
            ('Submitted'::varchar, 'Under Review'::varchar, NULL::text),
            ('Under Review'::varchar, 'Approved'::varchar, 'API đạt chuẩn chất lượng và hiệu năng cao.'),
            ('Approved'::varchar, 'Published'::varchar, 'Xuất bản trên Marketplace.')
        ) AS review(from_status, to_status, reason)
        JOIN apis a ON a.name IN ('Smart Commerce Catalog Pro API', 'OmniRetail Inventory & Catalog API')
        WHERE u.email_normalized = 'admin@example.com'
          AND NOT EXISTS (
              SELECT 1 FROM api_reviews ar
              WHERE ar.api_id = a.id
                AND ar.from_status = review.from_status
                AND ar.to_status = review.to_status
          );

        -- Promotional deals for Basic plans
        INSERT INTO api_plan_promotions (
            api_id, plan_id, title, badge_text, discount_percent,
            promo_price_monthly, currency, is_active, starts_at, expires_at
        )
        SELECT a.id, p.id,
               'Ưu đãi chuyển đổi gói Thương mại - Giảm 25% tháng đầu & gia hạn sớm',
               'DEAL GIẢM 25%',
               25,
               51750.00,
               p.currency,
               TRUE,
               CURRENT_TIMESTAMP - INTERVAL '2 days',
               CURRENT_TIMESTAMP + INTERVAL '30 days'
        FROM apis a
        JOIN api_plans p ON p.api_id = a.id AND p.name = 'Basic'
        WHERE a.name = 'Smart Commerce Catalog Pro API'
        ON CONFLICT (plan_id) DO NOTHING;

        INSERT INTO api_plan_promotions (
            api_id, plan_id, title, badge_text, discount_percent,
            promo_price_monthly, currency, is_active, starts_at, expires_at
        )
        SELECT a.id, p.id,
               'Flash Deal cho Developer tối ưu hiệu năng - Giảm 20%',
               'FLASH DEAL -20%',
               20,
               63200.00,
               p.currency,
               TRUE,
               CURRENT_TIMESTAMP - INTERVAL '1 day',
               CURRENT_TIMESTAMP + INTERVAL '21 days'
        FROM apis a
        JOIN api_plans p ON p.api_id = a.id AND p.name = 'Basic'
        WHERE a.name = 'OmniRetail Inventory & Catalog API'
        ON CONFLICT (plan_id) DO NOTHING;

        -- Pre-aggregated quality metrics for the new APIs (provider2@example.com)
        INSERT INTO provider_daily_aggregates (
            usage_date, provider_id, api_id, request_count, success_count,
            error_count, unique_consumers, active_subscribers, sandbox_revenue,
            updated_at, total_latency_ms
        )
        SELECT CURRENT_DATE - d.day_offset,
               a.provider_id,
               a.id,
               500,
               499,
               1,
               28,
               14,
               0,
               CURRENT_TIMESTAMP,
               9000
        FROM apis a
        CROSS JOIN generate_series(0, 13) AS d(day_offset)
        WHERE a.name = 'Smart Commerce Catalog Pro API'
        ON CONFLICT (usage_date, provider_id, api_id) DO NOTHING;

        INSERT INTO provider_daily_aggregates (
            usage_date, provider_id, api_id, request_count, success_count,
            error_count, unique_consumers, active_subscribers, sandbox_revenue,
            updated_at, total_latency_ms
        )
        SELECT CURRENT_DATE - d.day_offset,
               a.provider_id,
               a.id,
               1000,
               999,
               1,
               35,
               19,
               0,
               CURRENT_TIMESTAMP,
               15000
        FROM apis a
        CROSS JOIN generate_series(0, 13) AS d(day_offset)
        WHERE a.name = 'OmniRetail Inventory & Catalog API'
        ON CONFLICT (usage_date, provider_id, api_id) DO NOTHING;

    END IF;
END $$;

COMMIT;
