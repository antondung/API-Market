# Bàn giao Backend Sprint 5 — Nguyễn Như Tùng Dương

Phạm vi công việc theo [issue #22](https://github.com/antondung/API-Market/issues/22) và [yêu cầu bổ sung của Dũng](https://github.com/antondung/API-Market/issues/22#issuecomment-6702832988).

## Cost Guard · US-32

- `GET /api/consumer/cost-guard` trả ngân sách, chi phí ước tính, phần trăm ngân sách, các ngưỡng đã đạt (50, 80, 100) và tổng giao dịch sandbox thành công của tháng UTC hiện tại.
- `PUT /api/consumer/cost-guard` nhận `{"monthlyBudgetUsd":"30.00","hardCutoff":true}` hoặc `{"currency":"USD","monthlyBudget":"30.00","hardCutoff":true}`. Mỗi yêu cầu cập nhật một ngân sách theo loại tiền. Cả hai route yêu cầu JWT của Buyer (Consumer hoặc Provider).
- Mỗi request được Gateway tiếp nhận ghi lại giá của gói chia cho quota của kỳ thuê bao. Chi phí được cộng theo từng loại tiền và làm tròn hai chữ số thập phân để so ngân sách. `settledSandboxCharges` hiển thị riêng, tránh cộng hai lần cùng một khoản.
- Chi phí tính cả bản ghi đang chờ chuyển từ outbox sang usage log. Hai bảng được đọc trong cùng một snapshot PostgreSQL. Khi bật `hardCutoff`, Gateway khóa ngân sách theo Buyer và loại tiền trong lúc ghi reservation. Request trả phí bị từ chối với `429 BUDGET_EXHAUSTED` nếu đã chạm ngân sách hoặc dự kiến vượt mức. Request miễn phí vẫn theo rate limit và quota thông thường.
- Usage cũ thiếu snapshot giá được đếm trong `unpricedRequests`. Các ngưỡng nằm trong `reachedThresholds` để màn hình hiển thị. Hợp đồng và ví dụ request có tại `/docs` và `/openapi.json`.

## Provider Analytics · US-31

`GET /api/provider/analytics/overview?apiId=3&endpointId=8&from=2026-11-01&to=2026-11-10` yêu cầu JWT Provider và chỉ tổng hợp API thuộc tài khoản. Khoảng ngày tính theo UTC và bao gồm ngày cuối. `requests`, `apiBreakdown` và `topEndpoints` có tổng request, số lỗi 4xx/5xx và tỷ lệ lỗi, P50/P95/P99 latency và overhead. Danh sách top endpoint giới hạn 10 mục theo lượng gọi. Percentile trả `null` khi thiếu mẫu. Bộ lọc endpoint áp dụng cho lưu lượng; doanh thu sandbox và thuê bao giữ phạm vi API.

## Security · EN-11

| Phạm vi | Kết quả và bằng chứng |
| --- | --- |
| Xoay API key | Vá cách lách rate limit bằng khóa mới. Redis đếm theo Buyer, API và endpoint. Test HTTP xác nhận khóa cũ bị từ chối, khóa mới tiếp tục chịu giới hạn đã dùng. |
| Quyền và dữ liệu | Gateway kiểm tra lại key, vai trò Buyer và trạng thái Published khi nhận request. Test Cost Guard/Analytics kiểm tra đăng nhập, chống gán ngân sách cho người khác và cô lập dữ liệu. |
| Quota | Test PostgreSQL và Redis xác nhận chỉ một request đồng thời lấy được lượt cuối, hủy/gói hết hạn không gọi được và Redis lỗi thì Gateway từ chối. Cập nhật quota và ghi outbox cùng giao dịch. |
| SSRF và timeout | Test proxy kiểm tra IP nội bộ, kết quả DNS hỗn hợp, IP kết nối thực tế, đường dẫn/header không hợp lệ, redirect, timeout và giới hạn kích thước phản hồi. |
| Log | Test Gateway xác nhận dữ liệu usage dùng danh sách trường cho phép. API key thô và nội dung request/response không được ghi vào usage. |

Chạy `npm test`. Bằng chứng nằm trong [test Gateway](integration/gateway-metered.test.ts), [test usage](integration/usage.test.ts) và bộ test SafeProxy của repo.

## Tải Gateway · EN-12

`npm run loadtest:gateway` dùng PostgreSQL và Redis tạm, một key và thuê bao, upstream mô phỏng khoảng 2 ms, 20 lượt làm nóng và 200 lượt cho mỗi mức tải. Overhead lấy từ outbox, bao gồm xử lý tại Gateway trước upstream, còn RPS tính hết thời gian gửi và hoàn tất các lượt gọi. Các số trước/sau là lượt đo cục bộ trên cùng máy; tải production cần được đo riêng.

| Đồng thời | RPS trước | P95 trước | RPS sau | P50 sau | P95 sau | P99 sau | Lỗi sau |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 61.2 | 13 ms | 38.8 | 5 ms | 7 ms | 8 ms | 0/200 |
| 10 | 255.3 | 77 ms | 391.0 | 21 ms | 38 ms | 100 ms | 0/200 |
| 25 | 278.8 | 108 ms | 568.0 | 35 ms | 44 ms | 53 ms | 0/200 |

Đối soát đủ 620/620 usage logs sau khi flush, gồm cả lượt làm nóng. P95 đạt mục tiêu dưới 30 ms ở một luồng, còn 10 và 25 luồng vượt mục tiêu. Runner trả `SLA_MISSED` và exit code 1 nếu bất kỳ mức nào vượt ngưỡng. Các tối ưu đã thực hiện gồm bỏ giao dịch ghi ở bước tra route có sẵn, hạn chế cập nhật dấu thời gian dùng key, dùng lại câu lệnh đã chuẩn bị và ghi quota/outbox bằng một câu lệnh. Các lượt của cùng thuê bao vẫn tuần tự hóa khi giữ khóa quota để bảo toàn lượt cuối.

### Kiểm tra lại DEV-S5-03 ngày 11/11/2026

Gateway đã gộp tra route với endpoint, rút ngắn thời gian khóa quota gói miễn phí và ghi usage theo lô trong một câu lệnh. Khôi phục mặc định 10 kết nối PostgreSQL. Giữ ngưỡng QA P95 dưới 30 ms ở một luồng và dưới 60 ms khi chạy đồng thời.

| Kết nối tối đa | P95 1 luồng | P95 10 luồng | P95 25 luồng | Kết quả |
| ---: | ---: | ---: | ---: | --- |
| 20 | 5 ms | 27 ms | 105 ms | Vượt ngưỡng ở 25 luồng |
| 10 | 6 ms | 21 ms | 25 ms | Đạt |
| 10 | 5 ms | 18 ms | 29 ms | Đạt |

Mỗi lượt không có lỗi và lưu đủ 620/620 bản ghi. Hai ca hồi quy chứng minh PostgreSQL vẫn giữ đúng lượt cuối nếu Redis cho nhiều yêu cầu đi tiếp, và không chuyển tiếp yêu cầu nếu thuê bao bị hủy giữa chừng. Các số đo dùng workload gói miễn phí cục bộ.

## Migration và phát hành

1. Trên môi trường triển khai, sao lưu theo [runbook](../docs/06-production-rollback-runbook.md) và chạy production preflight bằng `npm run preflight:prod` với cấu hình thật. Backend production cũng kiểm tra ba secret JWT, sandbox và upstream độc lập.
2. Áp dụng `017_sprint5_cost_guard.sql` qua migration runner trước khi chạy backend mới. Với cấu hình local dùng `npm run db:migrate`. Với production dùng job `migrate` của Compose theo quy trình phát hành hiện có. Khi tích hợp [PR #104](https://github.com/antondung/API-Market/pull/104), giữ 015, 016 (chỉ seed demo) và 017 theo thứ tự trong danh sách migration. `git merge-tree` xác nhận hai PR cùng sửa danh sách này, còn các file SQL độc lập.
3. Trên staging, xác nhận readiness, hai endpoint Cost Guard, giới hạn Gateway và dữ liệu Analytics Provider bằng tài khoản kiểm thử. Đo lại P95 overhead với Redis/PostgreSQL và kết nối upstream gần cấu hình production. Kết quả cục bộ chưa xác nhận triển khai, QA hay SLA ở staging.
