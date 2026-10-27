# MA TRẬN NGHIỆM THU TƯƠNG TÁC FRONTEND - BACKEND (FE-BE ACCEPTANCE MATRIX)
## API-MARKET — SPRINT 3 FRONTEND RELEASE CANDIDATE

**Dự án:** Nền tảng Sàn giao dịch & Cổng API (API Hub & Marketplace)<br/>
**Nhánh:** `feature/sprint3-frontend-marketplace`<br/>
**Ngày lập ma trận:** 27/10/2026<br/>
**Tiêu chuẩn đánh giá:** Tương thích hợp đồng dữ liệu RESTful API, mã trạng thái HTTP, xử lý lỗi kiên cường và phân định ranh giới tính năng.

---

## 1. MA TRẬN GIAO DIỆN & ĐIỂM CUỐI (ENDPOINT INTEGRATION MATRIX)

| Phân hệ / Màn hình | Phương thức | Điểm cuối Backend (API Endpoint) | Mã phản hồi kỳ vọng | Cơ chế xử lý lỗi phía FE | Đánh giá |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Marketplace Catalog** | `GET` | `/api/marketplace/apis` | `200 OK` | Debounce 300ms, hiển thị Skeleton, phân trang an toàn | **ĐẠT** |
| **API Detail & Version** | `GET` | `/api/marketplace/apis/:id` | `200 OK`, `404 Not Found` | Xử lý 404 thân thiện, cô lập phiên bản không fallback | **ĐẠT** |
| **Sandbox Grant Status** | `GET` | `/api/consumer/apis/:apiId/sandbox` | `200 OK`, `401 Unauthorized`, `404 Not Found` | Không polling dồn dập, tự đếm ngược thời gian hết hạn | **ĐẠT** |
| **Sandbox Claim Grant** | `POST` | `/api/consumer/apis/:apiId/sandbox` | `200 OK`, `201 Created`, `400 Bad Request` | Unconditional claim reset, sequence guard `quotaSeqRef` | **ĐẠT** |
| **Playground Execution** | `POST` | `/api/marketplace/apis/:id/playground` | `200 OK`, `429 Rate Limit`, `502/504 Timeout` | Dual AbortController, `quotaSeqRef`, đối soát quota sau 502/504 | **ĐẠT** |
| **Consumer API Keys List**| `GET` | `/api/consumer/api-keys` | `200 OK`, `401 Unauthorized` | Phân trang 20 mục, hiển thị tiền tố `ak_live_...`, che dấu bí mật, phân biệt lỗi với 0 khóa | **ĐẠT** |
| **Create Consumer API Key**| `POST`| `/api/consumer/api-keys` | `201 Created`, `409 Conflict`, `403 Forbidden` | Tách biệt mutation và refresh; modal hiện secret 1 lần duy nhất | **ĐẠT** |
| **Rotate API Key** | `POST` | `/api/consumer/api-keys/:id/rotate` | `200 OK`, `404 Not Found` | Cảnh báo vô hiệu hóa khóa cũ trước khi xác nhận rotate | **ĐẠT** |
| **Revoke API Key** | `DELETE`| `/api/consumer/api-keys/:id` | `200 OK`, `404 Not Found` | Modal xác nhận hành động không thể hoàn tác; cập nhật danh sách | **ĐẠT** |
| **Authentication Login** | `POST` | `/api/auth/login` | `200 OK`, `401 Unauthorized` | Chuyển hướng an toàn `?redirect=...` với kiểm tra URL tương đối | **ĐẠT** |
| **Compare APIs View** | `GET` | `/api/marketplace/apis/:id` (2 calls) | `200 OK`, `500 Server Error` | Xử lý lỗi từng phần: 1 bên lỗi vẫn hiển thị bên thành công; đồng bộ 2 chiều URL; xử lý rỗng | **ĐẠT** |

---

## 2. KIỂM ĐỊNH MÃ TRẠNG THÁI HTTP & KHẢ NĂNG PHỤC HỒI MẠNG

| Mã HTTP | Tình huống thử nghiệm | Hành vi phía Frontend | Kết quả kiểm thử |
| :---: | :--- | :--- | :---: |
| **200 / 201** | Gọi API bình thường hoặc tạo thành công | Cập nhật UI ngay lập tức, chuyển tiếp dữ liệu an toàn | **ĐẠT** |
| **400** | Tham số truy vấn hoặc body không hợp lệ | Báo lỗi chi tiết từ server, đánh dấu trường vi phạm | **ĐẠT** |
| **401** | Hết hạn phiên hoặc chưa đăng nhập | Xóa token hỏng, điều hướng về `/login?redirect=...` | **ĐẠT** |
| **403** | Tài khoản không có vai trò phù hợp (vd: không phải Consumer) | Hiển thị thông báo quyền hạn rõ ràng, không làm gián đoạn UI | **ĐẠT** |
| **404** | API hoặc tài nguyên không tồn tại | Hiển thị trang/thẻ 404 thân thiện kèm nút quay về danh mục | **ĐẠT** |
| **409** | Trùng lặp khóa API cho cùng một API ID | Báo lỗi xung đột trực quan và hướng dẫn người dùng rotate | **ĐẠT** |
| **429** | Vượt quá tốc độ hoặc hết hạn ngạch Sandbox | Hiển thị cảnh báo Rate Limit kèm thông tin thời gian thử lại | **ĐẠT** |
| **500** | Lỗi máy chủ cơ sở dữ liệu nội bộ | Hiển thị nút "Thử lại", lưu giữ trạng thái giao diện hiện tại | **ĐẠT** |
| **502 / 504** | Lỗi Gateway Upstream / Timeout phản hồi | Hiển thị cảnh báo timeout, đối soát đọc lại Sandbox Grant | **ĐẠT** |
| **503** | Dịch vụ tạm ngưng bảo trì | Hiển thị thông báo trạng thái ngoại tuyến chuyên biệt | **ĐẠT** |

---

## 3. PHÂN ĐỊNH RANH GIỚI TÍNH NĂNG (FEATURE DEMARCATION & ROADMAP)

1. **Gói cước thương mại trả phí (Paid Commercial Subscriptions):**
   - *Hiện trạng:* Backend thanh toán và cổng thanh toán tự động nằm trong phạm vi kế hoạch của Sprint 4.
   - *Cách xử lý phía FE:* Vô hiệu hóa minh bạch nút thanh toán tại `CheckoutPage`, gắn nhãn "(Sprint 4)" rõ ràng, hiển thị đầy đủ thông tin biểu phí và điều khoản dịch vụ mà không giả lập giao dịch thanh toán thành công.
2. **Quản trị chi phí và ngắt tự động (Cost Guard & Hard Cutoff):**
   - *Hiện trạng:* Động cơ kiểm soát ngưỡng chi phí thời gian thực của Gateway đang được hoàn thiện cho Sprint 4.
   - *Cách xử lý phía FE:* Giao diện hiển thị cấu hình xem trước với trạng thái Read-only có ghi chú giải thích trung thực, loại bỏ hoàn toàn các thay đổi lưu tạm vào bộ nhớ mock.
3. **Quản lý Hồ sơ & Đổi mật khẩu (Profile & Change Password - PR #79):**
   - *Hiện trạng:* Phụ thuộc vào PR #79 phía Backend (User Profile & Change Password).
   - *Cách xử lý phía FE:* Giao diện hồ sơ người dùng và đổi mật khẩu phân định rõ ràng các trường dữ liệu và thông báo lỗi tương thích với đặc tả backend PR #79.
4. **Đính chính lịch sử nhánh về mã nguồn Gateway/Backend:**
   - *Hiện trạng:* Nhánh `feature/sprint3-frontend-marketplace` có lịch sử commit chứa một số thay đổi Gateway/Backend từ giai đoạn trước (ví dụ commit `d2c2316` chồng lấn PR #78).
   - *Ranh giới hiện tại:* Toàn bộ các vòng hoàn thiện từ RC trở đi tuyệt đối tuân thủ ranh giới Frontend-only, không tự can thiệp hay sửa chữa thêm vào Gateway/Backend.
5. **Trạng thái nghiệm thu phát hành:**
   - *Đánh giá:* **FRONTEND_SPRINT3_CONDITIONAL** (Đạt toàn diện các tiêu chí Frontend, Unit test và Playwright Chromium nội bộ; có điều kiện xác nhận qua CI GitHub Actions pipeline đầy đủ).

---

## 4. KẾT LUẬN

Ma trận nghiệm thu FE-BE khẳng định tính nhất quán, chính xác và kiên cường của Frontend API-Market Sprint 3 đối với mọi phản hồi từ hệ thống Backend và Gateway.
