BEGIN;

-- Backend completion of domain proof and explicit privacy declaration (issue #7).
-- Existing declarations stay unknown; never infer a false personal-data declaration.
ALTER TABLE api_legal_declarations
    ADD COLUMN processes_personal_data BOOLEAN,
    ADD COLUMN personal_data_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN data_processing_purpose TEXT;

ALTER TABLE api_legal_declarations ADD CONSTRAINT chk_legal_personal_data
CHECK (
    jsonb_typeof(personal_data_types) = 'array'
    AND (
        (processes_personal_data IS NULL AND jsonb_array_length(personal_data_types) = 0 AND data_processing_purpose IS NULL)
        OR (processes_personal_data = FALSE AND jsonb_array_length(personal_data_types) = 0 AND data_processing_purpose IS NULL)
        OR (processes_personal_data = TRUE AND jsonb_array_length(personal_data_types) > 0 AND data_processing_purpose IS NOT NULL AND LENGTH(BTRIM(data_processing_purpose)) > 0)
    )
);

CREATE TABLE api_domain_verifications (
    api_id INTEGER PRIMARY KEY REFERENCES apis(id) ON DELETE CASCADE,
    hostname VARCHAR(253) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    challenge_expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    verification_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_domain_token_hash CHECK (token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT chk_domain_verified CHECK (
        (verified_at IS NULL AND verification_expires_at IS NULL)
        OR (verified_at IS NOT NULL AND verification_expires_at > verified_at)
    )
);

COMMIT;
