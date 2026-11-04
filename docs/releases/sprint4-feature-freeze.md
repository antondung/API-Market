# Sprint 4 — feature freeze 2026-11-09

Status: **Pending**. Chủ trì: Nguyễn Tấn Dũng. Issue #16. Tài liệu chuẩn bị, chưa phải tuyên bố freeze hoặc QA sign-off.

Điều kiện chốt: merge/review schema#91, backend#92 và phần operations (PR #93 cùng phần bổ sung Restore, kiểm thử 429/403 và workflow CD); CI commit cuối xanh; image GHCR được deploy lên staging thật bằng `cd-staging` (cần `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY` và file `.env.staging` trên máy chủ); smoke Marketplace→Subscription/Payment→Key→Gateway→Usage đạt, gồm Suspend, Restore không đổi quota (kỳ đã hết thì Expired, không về Active), Revoke, 429 và hết quota; worker reset/expiry và heartbeat đạt; Vân QA không còn Critical/High thuộc phạm vi; Hải Dương xác nhận tích hợp giao diện Consumer; backup/rollback và secret upstream đã cấu hình.

Biên bản cần điền ngày09/11 hoặc lúc Tech Lead thực sự chốt: commit/image, URL staging, thời gian rollout, CI/smoke/test report, người review/QA, lỗi được chấp nhận và người chịu trách nhiệm, cách rollback. Không tự điền PASS từ kết quả local/CI. Khi freeze có hiệu lực, chỉ tiếp nhận bug fix được review; tính năng mới chuyển sprint sau.
