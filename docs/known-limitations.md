# Hạn chế đã biết

## Thời gian Suspended vẫn tính vào kỳ 30 ngày

Khi Admin đình chỉ một subscription, `current_period_end` không dừng lại. Số ngày ở trạng thái Suspended vẫn nằm trong kỳ 30 ngày đã mua.

Nếu kỳ đã hết trước khi bấm Mở khóa, Restore không trả về Active hay Past Due. Subscription chuyển sang Expired. `quota_used` không bị xóa trong cả hai trường hợp.

Chưa có cơ chế cộng bù số ngày bị đình chỉ. Điểm này đang chờ Tech Lead quyết định.

## Gateway tuần tự hóa request trên cùng một subscription

`GatewayEntitlement.reserve` mở transaction và khóa dòng subscription bằng `FOR UPDATE OF s` để quota luôn chính xác dưới tải đồng thời. Hệ quả: các request của **cùng một Consumer trên cùng một API** xếp hàng tuần tự.

Đo trên máy local (`npm run loadtest:gateway`):

| Đồng thời | RPS | P95 overhead |
| ---: | ---: | ---: |
| 1 | ~40 | 13–19 ms |
| 10 | ~270–320 | 38–59 ms |
| 25 | ~340–380 | 84–150 ms |

Ngưỡng SLA trong runner: P95 < 30 ms khi đồng thời = 1, P95 < 60 ms khi đồng thời > 1. Mức 25 vượt ngưỡng trên máy local.

Đây là đánh đổi có chủ đích: nới khóa sẽ cho phép vượt quota. Nếu cần throughput cao hơn cho một Consumer, hướng xử lý là gộp quota vào Redis Lua script (đã có sẵn cho rate limit) và chỉ ghi PostgreSQL theo lô — chưa làm vì chưa có yêu cầu tải thật.

## Provider Analytics trả 404 khi hỏi API của người khác

`GET /api/provider/analytics/overview?apiId=<không thuộc mình>` trả `404 NOT_FOUND` thay vì báo cáo rỗng, để không xác nhận sự tồn tại của API đó. Không truyền `apiId` thì trả tổng hợp toàn bộ API của mình.
