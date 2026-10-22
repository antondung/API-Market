BEGIN;

-- Preserve imported OpenAPI while tracking whether manual endpoint edits need a reimport.
-- Existing imports remain readable; missing documentation is still rejected at submission.
ALTER TABLE api_versions
    ADD COLUMN documentation_stale BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
