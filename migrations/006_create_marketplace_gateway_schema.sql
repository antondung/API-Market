BEGIN;

-- Sprint 3 — Marketplace, Playground/Gateway và API Key.
-- Không lưu API key thô, Authorization header, request body hoặc response body.

-- ================================================================
-- 1. Routing registry cho Gateway (US-22)
-- ================================================================

CREATE TABLE gateway_routes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL UNIQUE,
    upstream_base_url TEXT NOT NULL,
    timeout_ms INTEGER NOT NULL DEFAULT 10000,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gateway_routes_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_gateway_routes_upstream_url
        CHECK (upstream_base_url ~* '^https?://'),
    CONSTRAINT chk_gateway_routes_timeout
        CHECK (timeout_ms BETWEEN 100 AND 60000)
);

-- ================================================================
-- 2. Try Before Subscribe — cấp và tiêu thụ lượt thử (US-19)
-- ================================================================

CREATE TABLE sandbox_grants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consumer_id INTEGER NOT NULL,
    api_id INTEGER NOT NULL,
    max_requests SMALLINT NOT NULL DEFAULT 5,
    used_requests INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sandbox_grants_consumer
        FOREIGN KEY (consumer_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_sandbox_grants_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_sandbox_grants_consumer_api
        UNIQUE (consumer_id, api_id),
    CONSTRAINT chk_sandbox_grants_max_requests
        CHECK (max_requests BETWEEN 1 AND 10),
    CONSTRAINT chk_sandbox_grants_used_requests
        CHECK (used_requests BETWEEN 0 AND max_requests)
);

-- ================================================================
-- 3. API Key — chỉ lưu SHA-256 hash, không lưu plaintext (US-21)
-- ================================================================

CREATE TABLE api_keys (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    api_id INTEGER NOT NULL,
    key_prefix VARCHAR(32) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    label VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_keys_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_api_keys_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_api_keys_hash
        UNIQUE (key_hash),
    CONSTRAINT chk_api_keys_hash
        CHECK (key_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT chk_api_keys_prefix
        CHECK (key_prefix ~ '^[A-Za-z0-9_-]{4,32}$'),
    CONSTRAINT chk_api_keys_label
        CHECK (label IS NULL OR LENGTH(BTRIM(label)) > 0),
    CONSTRAINT chk_api_keys_lifecycle
        CHECK (
            (is_active IS TRUE AND revoked_at IS NULL)
            OR (is_active IS FALSE AND revoked_at IS NOT NULL)
        )
);

-- Khi rotate/revoke key cũ trước, index này cho phép tạo một key active mới.
CREATE UNIQUE INDEX uq_api_keys_active_user_api
    ON api_keys (user_id, api_id)
    WHERE is_active;

-- Gateway lookup theo hash; UNIQUE ở trên đã tạo index cho key_hash.
CREATE INDEX idx_api_keys_user_api_active
    ON api_keys (user_id, api_id, created_at DESC)
    WHERE is_active;

CREATE INDEX idx_sandbox_grants_api_active
    ON sandbox_grants (api_id, expires_at)
    WHERE revoked_at IS NULL;

-- ================================================================
-- 4. Marketplace Search / Filter / Sort / Pagination (US-16)
-- ================================================================

-- Mặc định Marketplace chỉ đọc API Published và sắp newest-first ổn định.
CREATE INDEX idx_apis_marketplace_published_newest
    ON apis (published_at DESC, id DESC)
    INCLUDE (provider_id, name, category)
    WHERE status = 'Published';

CREATE INDEX idx_apis_marketplace_category_published
    ON apis (category, published_at DESC, id DESC)
    WHERE status = 'Published';

-- Dùng với: tags @> jsonb_build_array($tag::text).
CREATE INDEX idx_apis_marketplace_tags
    ON apis USING GIN (tags jsonb_path_ops)
    WHERE status = 'Published';

-- Dùng với: to_tsvector(...) @@ websearch_to_tsquery('simple', $query).
CREATE INDEX idx_apis_marketplace_search
    ON apis USING GIN (
        to_tsvector(
            'simple'::regconfig,
            COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(category, '')
        )
    )
    WHERE status = 'Published';

-- Lấy plan active rẻ nhất / lọc khoảng giá mà không quét toàn bộ plan.
CREATE INDEX idx_api_plans_marketplace_active_price
    ON api_plans (api_id, price_monthly, id)
    WHERE is_active;

-- ================================================================
-- 5. Đồng bộ updated_at và tiêu thụ lượt thử nguyên tử
-- ================================================================

CREATE OR REPLACE FUNCTION touch_sprint3_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gateway_routes_touch_updated_at
BEFORE UPDATE ON gateway_routes
FOR EACH ROW EXECUTE FUNCTION touch_sprint3_updated_at();

CREATE TRIGGER trg_sandbox_grants_touch_updated_at
BEFORE UPDATE ON sandbox_grants
FOR EACH ROW EXECUTE FUNCTION touch_sprint3_updated_at();

CREATE TRIGGER trg_api_keys_touch_updated_at
BEFORE UPDATE ON api_keys
FOR EACH ROW EXECUTE FUNCTION touch_sprint3_updated_at();

-- Một UPDATE có điều kiện là atomic: dù nhiều request đến cùng lúc,
-- used_requests không bao giờ vượt max_requests.
CREATE OR REPLACE FUNCTION consume_sandbox_grant(
    p_consumer_id INTEGER,
    p_api_id INTEGER
)
RETURNS TABLE (sandbox_grant_id BIGINT, remaining_requests INTEGER)
AS $$
BEGIN
    RETURN QUERY
    UPDATE sandbox_grants AS grant_row
       SET used_requests = grant_row.used_requests + 1,
           updated_at = CURRENT_TIMESTAMP
      FROM apis AS api_row
     WHERE grant_row.consumer_id = p_consumer_id
       AND grant_row.api_id = p_api_id
       AND api_row.id = grant_row.api_id
       AND api_row.status = 'Published'
       AND grant_row.revoked_at IS NULL
       AND grant_row.expires_at > CURRENT_TIMESTAMP
       AND grant_row.used_requests < grant_row.max_requests
    RETURNING grant_row.id, grant_row.max_requests - grant_row.used_requests;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sandbox grant is unavailable, expired, exhausted, or API is not published'
            USING ERRCODE = 'P0001';
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMIT;
