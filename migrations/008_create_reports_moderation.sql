BEGIN;

-- Sprint 3 / US-15 - Consumer reports and API moderation.
-- Report descriptions and moderation notes must never contain credentials,
-- Authorization headers, API keys, cookies, or raw request/response payloads.

CREATE TABLE reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    api_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    category VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'Pending',
    reviewed_by INTEGER,
    reviewed_at TIMESTAMPTZ,
    action_taken TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_api FOREIGN KEY (api_id) REFERENCES apis(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_reports_category CHECK (category IN (
        'Security Vulnerability', 'Copyright / IP Infringement',
        'Extreme Downtime', 'Malicious Data'
    )),
    CONSTRAINT chk_reports_description
        CHECK (LENGTH(BTRIM(description)) BETWEEN 10 AND 5000),
    CONSTRAINT chk_reports_status
        CHECK (status IN ('Pending', 'Under Investigation', 'Resolved', 'Dismissed')),
    CONSTRAINT chk_reports_moderation_lifecycle CHECK (
        (status = 'Pending'
            AND reviewed_by IS NULL AND reviewed_at IS NULL AND action_taken IS NULL)
        OR (status = 'Under Investigation'
            AND reviewed_by IS NOT NULL AND reviewed_at IS NULL AND action_taken IS NULL)
        OR (status IN ('Resolved', 'Dismissed')
            AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL
            AND action_taken IS NOT NULL AND LENGTH(BTRIM(action_taken)) > 0)
    )
);

CREATE INDEX idx_reports_status_created_at ON reports (status, created_at DESC, id DESC);
CREATE INDEX idx_reports_api_created_at ON reports (api_id, created_at DESC);
CREATE INDEX idx_reports_reporter_created_at ON reports (reporter_id, created_at DESC);

CREATE TRIGGER trg_reports_touch_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION touch_sprint3_updated_at();

-- Replace constraints created by migration 003 for already-installed databases.
ALTER TABLE apis DROP CONSTRAINT chk_apis_status;
ALTER TABLE apis
    ADD CONSTRAINT chk_apis_status CHECK (status IN (
        'Draft', 'Submitted', 'Under Review', 'Approved', 'Published', 'Rejected', 'Suspended'
    ));

-- Preserve the first publication timestamp across suspend/restore moderation.
ALTER TABLE apis DROP CONSTRAINT chk_apis_published_at;
ALTER TABLE apis
    ADD CONSTRAINT chk_apis_published_at
        CHECK (published_at IS NULL OR status IN ('Published', 'Suspended'));

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
            OR (OLD.status = 'Published' AND NEW.status = 'Suspended')
            OR (OLD.status = 'Suspended' AND NEW.status = 'Published')
        ) THEN
            RAISE EXCEPTION 'Invalid API status transition: % -> %', OLD.status, NEW.status USING ERRCODE = '23514';
        END IF;

        IF NEW.status = 'Submitted' AND NOT EXISTS (
            SELECT 1 FROM provider_verifications pv
            WHERE pv.provider_id = NEW.provider_id AND pv.status = 'Verified'
        ) THEN
            RAISE EXCEPTION 'Only a verified provider can submit an API for review' USING ERRCODE = '23514';
        END IF;

        IF NEW.status = 'Submitted' THEN NEW.submitted_at := CURRENT_TIMESTAMP; END IF;
        IF NEW.status = 'Approved' THEN NEW.approved_at := CURRENT_TIMESTAMP; END IF;
        IF NEW.status = 'Published' AND OLD.status <> 'Suspended' THEN NEW.published_at := CURRENT_TIMESTAMP; END IF;
    END IF;

    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
