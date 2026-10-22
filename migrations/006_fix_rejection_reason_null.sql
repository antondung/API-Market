BEGIN;

-- Fix: CHECK constraints accepted NULL rejection reasons (issue reported by Tung Duong).
-- LENGTH(BTRIM(NULL)) evaluates to NULL, and PostgreSQL treats a NULL CHECK result as
-- satisfied, so a Rejected row could be stored without a reason. Empty and whitespace-only
-- strings were already rejected; only NULL slipped through.
--
-- Migration 003 is already applied in existing databases, so the constraints are replaced
-- here instead of edited in place.

-- 1. provider_verifications: a Rejected decision must carry a non-blank reason.
ALTER TABLE provider_verifications
    DROP CONSTRAINT chk_provider_verifications_review;

ALTER TABLE provider_verifications
    ADD CONSTRAINT chk_provider_verifications_review
        CHECK (
            (status = 'Pending' AND reviewed_at IS NULL AND reviewed_by IS NULL AND reject_reason IS NULL)
            OR (status = 'Verified' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND reject_reason IS NULL)
            OR (status = 'Rejected' AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL
                AND reject_reason IS NOT NULL AND LENGTH(BTRIM(reject_reason)) > 0)
        );

-- 2. api_reviews: a Rejected transition must carry a non-blank reason.
ALTER TABLE api_reviews
    DROP CONSTRAINT chk_api_reviews_rejection_reason;

ALTER TABLE api_reviews
    ADD CONSTRAINT chk_api_reviews_rejection_reason
        CHECK (to_status <> 'Rejected' OR (reason IS NOT NULL AND LENGTH(BTRIM(reason)) > 0));

COMMIT;