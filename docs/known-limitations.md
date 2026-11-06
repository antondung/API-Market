# Hạn chế đã biết

## Thời gian Suspended vẫn tính vào kỳ 30 ngày

Khi Admin đình chỉ một subscription, `current_period_end` không dừng lại. Số ngày ở trạng thái Suspended vẫn nằm trong kỳ 30 ngày đã mua.

Nếu kỳ đã hết trước khi bấm Mở khóa, Restore không trả về Active hay Past Due. Subscription chuyển sang Expired. `quota_used` không bị xóa trong cả hai trường hợp.

Chưa có cơ chế cộng bù số ngày bị đình chỉ. Điểm này đang chờ Tech Lead quyết định.
