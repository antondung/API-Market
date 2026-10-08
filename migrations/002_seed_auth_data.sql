BEGIN;


-- =========================================
-- 1. SEED ROLES
-- =========================================

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'Quản trị viên hệ thống'),
    ('USER', 'Người dùng thông thường'),
    ('API_PROVIDER', 'Nhà cung cấp API')
ON CONFLICT (name) DO NOTHING;


-- =========================================
-- 2. SEED USERS
-- =========================================

INSERT INTO users (
    name,
    email,
    password_hash,
    role_id
)
VALUES
(
    'System Admin',
    'admin@example.com',

    -- Password: Admin@123
    crypt('Admin@123', gen_salt('bf', 12)),

    (
        SELECT id
        FROM roles
        WHERE name = 'ADMIN'
    )
),

(
    'Demo User',
    'user@example.com',

    -- Password: User@123
    crypt('User@123', gen_salt('bf', 12)),

    (
        SELECT id
        FROM roles
        WHERE name = 'USER'
    )
),

(
    'Demo API Provider',
    'provider@example.com',

    -- Password: Provider@123
    crypt('Provider@123', gen_salt('bf', 12)),

    (
        SELECT id
        FROM roles
        WHERE name = 'API_PROVIDER'
    )
)

ON CONFLICT (email_normalized) DO NOTHING;


-- =========================================
-- 3. SEED API PROVIDER
-- =========================================

INSERT INTO api_providers (
    user_id,
    provider_name,
    endpoint_url,
    description
)
SELECT
    u.id,
    'Demo API Provider',
    'https://api.example.com',
    'Nhà cung cấp API dùng cho môi trường development'
FROM users u
WHERE u.email_normalized = 'provider@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM api_providers ap
      WHERE ap.user_id = u.id
  );


COMMIT;