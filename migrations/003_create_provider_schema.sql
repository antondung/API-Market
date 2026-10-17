BEGIN;

-- Sprint 2 — Provider đăng và xuất bản API (Issue #9)
-- Các giá trị trạng thái dùng cùng tên với backend/src/provider-domain.ts.

CREATE TABLE provider_verifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    contact_email TEXT NOT NULL,
    evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    reject_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    reviewed_by INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_provider_verifications_provider
        FOREIGN KEY (provider_id) REFERENCES api_providers(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_provider_verifications_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_provider_verifications_status
        CHECK (status IN ('Pending', 'Verified', 'Rejected')),
    CONSTRAINT chk_provider_verifications_evidence_urls
        CHECK (jsonb_typeof(evidence_urls) = 'array' AND jsonb_array_length(evidence_urls) > 0),
    CONSTRAINT chk_provider_verifications_review
        CHECK (
            (status = 'Pending' AND reviewed_at IS NULL AND reviewed_by IS NULL AND reject_reason IS NULL)
            OR (status = 'Verified' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND reject_reason IS NULL)
            OR (status = 'Rejected' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND LENGTH(BTRIM(reject_reason)) > 0)
        )
);

CREATE TABLE agreements (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    version VARCHAR(64) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_agreements_version CHECK (LENGTH(BTRIM(version)) > 0),
    CONSTRAINT chk_agreements_content CHECK (LENGTH(BTRIM(content)) > 0)
);

CREATE UNIQUE INDEX uq_agreements_one_active
    ON agreements (is_active)
    WHERE is_active;

CREATE TABLE apis (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_url TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_apis_provider
        FOREIGN KEY (provider_id) REFERENCES api_providers(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_apis_provider_name UNIQUE (provider_id, name),
    CONSTRAINT chk_apis_name CHECK (LENGTH(BTRIM(name)) > 0),
    CONSTRAINT chk_apis_description CHECK (LENGTH(BTRIM(description)) > 0),
    CONSTRAINT chk_apis_category CHECK (LENGTH(BTRIM(category)) > 0),
    CONSTRAINT chk_apis_base_url CHECK (base_url ~* '^https?://'),
    CONSTRAINT chk_apis_tags CHECK (jsonb_typeof(tags) = 'array'),
    CONSTRAINT chk_apis_status CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Published', 'Rejected')),
    CONSTRAINT chk_apis_published_at CHECK (published_at IS NULL OR status = 'Published')
);

CREATE TABLE api_versions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    version VARCHAR(64) NOT NULL,
    changelog TEXT NOT NULL DEFAULT '',
    openapi_document JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_versions_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_api_versions_api_version UNIQUE (api_id, version),
    CONSTRAINT uq_api_versions_id_api UNIQUE (id, api_id),
    CONSTRAINT chk_api_versions_version CHECK (LENGTH(BTRIM(version)) > 0)
);

CREATE TABLE api_endpoints (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    version_id INTEGER NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    description TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '[]'::jsonb,
    request_schema JSONB,
    response_example JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_endpoints_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_api_endpoints_version_api
        FOREIGN KEY (version_id, api_id) REFERENCES api_versions(id, api_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_api_endpoints_version_method_path UNIQUE (version_id, method, path),
    CONSTRAINT chk_api_endpoints_method CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE')),
    CONSTRAINT chk_api_endpoints_path CHECK (path LIKE '/%'),
    CONSTRAINT chk_api_endpoints_description CHECK (LENGTH(BTRIM(description)) > 0),
    CONSTRAINT chk_api_endpoints_parameters CHECK (jsonb_typeof(parameters) = 'array')
);

CREATE TABLE api_documentations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    version_id INTEGER NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'OPENAPI_IMPORT',
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_documentations_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_api_documentations_version_api
        FOREIGN KEY (version_id, api_id) REFERENCES api_versions(id, api_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_api_documentations_version UNIQUE (version_id),
    CONSTRAINT chk_api_documentations_source CHECK (source IN ('OPENAPI_IMPORT', 'MANUAL')),
    CONSTRAINT chk_api_documentations_content CHECK (jsonb_typeof(content) IN ('object', 'array'))
);

CREATE TABLE api_plans (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    name VARCHAR(20) NOT NULL,
    price_monthly NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    quota BIGINT NOT NULL,
    rate_limit INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_plans_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_api_plans_api_name UNIQUE (api_id, name),
    CONSTRAINT chk_api_plans_name CHECK (name IN ('Free', 'Basic', 'Pro')),
    CONSTRAINT chk_api_plans_price CHECK (price_monthly >= 0 AND (name <> 'Free' OR price_monthly = 0)),
    CONSTRAINT chk_api_plans_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_api_plans_quota CHECK (quota > 0),
    CONSTRAINT chk_api_plans_rate_limit CHECK (rate_limit > 0)
);

CREATE TABLE api_legal_declarations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL UNIQUE,
    agreement_id INTEGER NOT NULL,
    ownership_declaration TEXT NOT NULL,
    distribution_rights TEXT NOT NULL,
    data_classification VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_legal_declarations_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_api_legal_declarations_agreement
        FOREIGN KEY (agreement_id) REFERENCES agreements(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_api_legal_declarations_ownership CHECK (LENGTH(BTRIM(ownership_declaration)) > 0),
    CONSTRAINT chk_api_legal_declarations_distribution CHECK (LENGTH(BTRIM(distribution_rights)) > 0),
    CONSTRAINT chk_api_legal_declarations_classification CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'Restricted'))
);

CREATE TABLE api_reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    from_status VARCHAR(20) NOT NULL,
    to_status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_reviews_api
        FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_api_reviews_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_api_reviews_from_status CHECK (from_status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Published', 'Rejected')),
    CONSTRAINT chk_api_reviews_to_status CHECK (to_status IN ('Draft', 'Submitted', 'Under Review', 'Approved', 'Published', 'Rejected')),
    CONSTRAINT chk_api_reviews_transition CHECK (
        (from_status = 'Submitted' AND to_status = 'Under Review')
        OR (from_status = 'Under Review' AND to_status IN ('Approved', 'Rejected'))
        OR (from_status = 'Approved' AND to_status = 'Published')
    ),
    CONSTRAINT chk_api_reviews_rejection_reason CHECK (to_status <> 'Rejected' OR LENGTH(BTRIM(reason)) > 0)
);

CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id INTEGER,
    actor_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id TEXT,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_audit_logs_actor_role CHECK (actor_role IS NULL OR actor_role IN ('USER', 'API_PROVIDER', 'ADMIN')),
    CONSTRAINT chk_audit_logs_action CHECK (LENGTH(BTRIM(action)) > 0),
    CONSTRAINT chk_audit_logs_target CHECK (
        (target_type IS NULL AND target_id IS NULL) OR (target_type IS NOT NULL AND target_id IS NOT NULL)
    ),
    CONSTRAINT chk_audit_logs_detail CHECK (jsonb_typeof(detail) = 'object')
);

-- Lọc nhật ký theo người thực hiện, đối tượng hoặc thời điểm.
CREATE INDEX idx_provider_verifications_provider_status ON provider_verifications(provider_id, status);
CREATE INDEX idx_apis_provider_status ON apis(provider_id, status);
CREATE INDEX idx_apis_status_submitted_at ON apis(status, submitted_at) WHERE status IN ('Submitted', 'Under Review');
CREATE INDEX idx_api_versions_api_id ON api_versions(api_id);
CREATE INDEX idx_api_endpoints_api_id ON api_endpoints(api_id);
CREATE INDEX idx_api_plans_api_id ON api_plans(api_id);
CREATE INDEX idx_api_reviews_api_created_at ON api_reviews(api_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created_at ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_target_created_at ON audit_logs(target_type, target_id, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Chỉ cho phép các bước chuyển trạng thái của quy trình duyệt API.
CREATE OR REPLACE FUNCTION enforce_api_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status <> 'Draft' THEN
            RAISE EXCEPTION 'A new API must start in Draft state' USING ERRCODE = '23514';
        END IF;
        RETURN NEW;
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF NOT (
            (OLD.status = 'Draft' AND NEW.status = 'Submitted')
            OR (OLD.status = 'Submitted' AND NEW.status = 'Under Review')
            OR (OLD.status = 'Under Review' AND NEW.status IN ('Approved', 'Rejected'))
            OR (OLD.status = 'Approved' AND NEW.status = 'Published')
            OR (OLD.status = 'Rejected' AND NEW.status = 'Draft')
        ) THEN
            RAISE EXCEPTION 'Invalid API status transition: % -> %', OLD.status, NEW.status USING ERRCODE = '23514';
        END IF;

        IF NEW.status = 'Submitted' AND NOT EXISTS (
            SELECT 1
            FROM provider_verifications pv
            WHERE pv.provider_id = NEW.provider_id AND pv.status = 'Verified'
        ) THEN
            RAISE EXCEPTION 'Only a verified provider can submit an API for review' USING ERRCODE = '23514';
        END IF;

        IF NEW.status = 'Submitted' THEN NEW.submitted_at := CURRENT_TIMESTAMP; END IF;
        IF NEW.status = 'Approved' THEN NEW.approved_at := CURRENT_TIMESTAMP; END IF;
        IF NEW.status = 'Published' THEN NEW.published_at := CURRENT_TIMESTAMP; END IF;
    END IF;

    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apis_enforce_status_transition
BEFORE INSERT OR UPDATE ON apis
FOR EACH ROW EXECUTE FUNCTION enforce_api_status_transition();

COMMIT;
