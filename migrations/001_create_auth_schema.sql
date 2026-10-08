BEGIN;

-- Extension dùng cho hash mật khẩu trong seed
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================
-- 1. BẢNG ROLES
-- =========================================

CREATE TABLE roles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_roles_name
        CHECK (name IN ('ADMIN', 'USER', 'API_PROVIDER'))
);


-- =========================================
-- 2. BẢNG USERS
-- =========================================

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email TEXT NOT NULL,

    -- Email chuẩn hóa để chống:
    -- Admin@Email.com
    -- admin@email.com
    -- ADMIN@EMAIL.COM
    -- trở thành 3 tài khoản khác nhau
    email_normalized TEXT
        GENERATED ALWAYS AS (LOWER(BTRIM(email))) STORED,

    password_hash TEXT NOT NULL,

    role_id INTEGER NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email_normalized
        UNIQUE (email_normalized),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_users_name
        CHECK (LENGTH(BTRIM(name)) > 0),

    CONSTRAINT chk_users_email
        CHECK (LENGTH(BTRIM(email)) > 0)
);


-- =========================================
-- 3. BẢNG API PROVIDERS
-- =========================================

CREATE TABLE api_providers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    provider_name VARCHAR(100) NOT NULL,

    endpoint_url TEXT,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_api_providers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_api_provider_name
        CHECK (LENGTH(BTRIM(provider_name)) > 0)
);


-- =========================================
-- 4. BẢNG REFRESH TOKENS
-- =========================================

CREATE TABLE refresh_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================
-- 5. INDEX
-- =========================================

CREATE INDEX idx_users_role_id
    ON users(role_id);

CREATE INDEX idx_api_providers_user_id
    ON api_providers(user_id);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);


COMMIT;