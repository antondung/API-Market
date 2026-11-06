BEGIN;

-- Remember Active or Past Due so Restore can return that status.
-- Rows suspended before this column existed stay NULL and Restore treats them as Active.
ALTER TABLE subscriptions ADD COLUMN status_before_suspend VARCHAR(20);
ALTER TABLE subscriptions ADD CONSTRAINT chk_subscriptions_status_before_suspend
    CHECK (status_before_suspend IS NULL OR status_before_suspend IN ('Active', 'Past Due'));

COMMIT;
