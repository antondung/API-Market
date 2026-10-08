PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =========================================
-- 1. Bảng vai trò
-- =========================================

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (name IN ('ADMIN', 'USER', 'API_PROVIDER'))
);


-- =========================================
-- 2. Bảng người dùng
-- =========================================

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT NOT NULL
        COLLATE NOCASE
        UNIQUE,

    password_hash TEXT NOT NULL,

    role_id INTEGER NOT NULL,

    is_active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CHECK (length(trim(name)) > 0),
    CHECK (length(trim(email)) > 0),
    CHECK (is_active IN (0, 1))
);


-- =========================================
-- 3. Thông tin nhà cung cấp API
-- =========================================

CREATE TABLE api_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    provider_name TEXT NOT NULL,

    endpoint_url TEXT,

    description TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CHECK (length(trim(provider_name)) > 0)
);


-- =========================================
-- 4. Refresh Token
-- =========================================

CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,

    revoked_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================
-- 5. Index
-- =========================================

CREATE INDEX idx_users_role_id
ON users(role_id);

CREATE INDEX idx_refresh_tokens_user_id
ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
ON refresh_tokens(expires_at);


COMMIT;