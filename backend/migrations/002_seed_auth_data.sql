PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'Quản trị viên hệ thống'),
    ('USER', 'Người dùng thông thường'),
    ('API_PROVIDER', 'Nhà cung cấp API');

COMMIT;