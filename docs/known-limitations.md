# Hạn chế đã biết

## Thời gian Suspended vẫn tính vào kỳ 30 ngày

Khi Admin đình chỉ một subscription, `current_period_end` không dừng lại. Số ngày ở trạng thái Suspended vẫn nằm trong kỳ 30 ngày đã mua.

Nếu kỳ đã hết trước khi bấm Mở khóa, Restore không trả về Active hay Past Due. Subscription chuyển sang Expired. `quota_used` không bị xóa trong cả hai trường hợp.

Chưa có cơ chế cộng bù số ngày bị đình chỉ. Điểm này đang chờ Tech Lead quyết định.

## Gateway giữ quota nhất quán khi gọi đồng thời

Với gói giá bằng 0, Gateway kiểm tra Redis trước rồi dùng một câu lệnh PostgreSQL để kiểm tra lại thuê bao và API key, cập nhật quota và ghi outbox. PostgreSQL vẫn từ chối khi hết quota nếu Redis mất bộ đếm. Với gói trả phí, Gateway giữ khóa dòng thuê bao trong giao dịch để đồng bộ quota, Cost Guard và outbox. Các request trả phí của cùng một Consumer trên cùng một API vẫn chờ nhau ở bước này.

Đo trên máy local (`npm run loadtest:gateway`):

| Đồng thời | RPS | P95 overhead |
| ---: | ---: | ---: |
| 1 | 40–57 | 5–6 ms |
| 10 | 678 | 18–21 ms |
| 25 | 963–1053 | 25–29 ms |

Hai lượt đo dùng một thuê bao miễn phí, PostgreSQL và Redis tạm trên Windows, với tối đa 10 kết nối PostgreSQL. Mỗi lượt ghi đủ 620 bản ghi, không có lỗi. Ngưỡng SLA trong runner là P95 < 30 ms khi đồng thời = 1 và P95 < 60 ms khi đồng thời > 1.

Gateway mặc định dùng tối đa 10 kết nối và có thể điều chỉnh bằng `PG_POOL_MAX`. Trong lượt đo cùng mã với pool 20, PostgreSQL mở thêm 10 kết nối ở mức 25 luồng và P95 lên 105 ms. Số đo trên xác nhận workload cục bộ đã kiểm thử. Staging và tải gói trả phí cần đo riêng.

## Provider Analytics trả 404 khi hỏi API của người khác

`GET /api/provider/analytics/overview?apiId=<không thuộc mình>` trả `404 NOT_FOUND` thay vì báo cáo rỗng, để không xác nhận sự tồn tại của API đó. Không truyền `apiId` thì trả tổng hợp toàn bộ API của mình.
