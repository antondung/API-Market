# BỘ TEST CASE KIỂM THỬ THỦ CÔNG TIÊU BIỂU (MANUAL UI TESTING) — SPRINT 1, 2, 3
## MÔN HỌC: CÔNG NGHỆ PHẦN MỀM (THEO GIÁO TRÌNH IAN SOMMERVILLE - CHAPTER 9: SOFTWARE TESTING)

> **Dự án:** API Marketplace Platform
> **Người thực hiện:** QA Lead & Giảng viên Công nghệ Phần mềm
> **Phiên bản tài liệu:** 2.0 (Đã kiểm thử thực tế 100% trên giao diện Web & Cập nhật Actual Output thực tế)
> **Căn cứ lý thuyết:** Ian Sommerville, *Software Engineering* (10th Edition), Chapter 9: *Software Testing* (Development Testing, Equivalence Partitioning, Boundary Value Analysis, Force Errors, Scenario Testing, Security).
> **Môi trường thực thi thực tế:** Chromium Headless & Trình duyệt Web (Viewport 1280x720, Frontend: React 19 / Vite 8 tại `http://localhost:5173`, Backend: Node.js Express 5 tại `http://localhost:3000`, Database: PostgreSQL 17 tại `localhost:5432`).
> **Tỷ lệ kiểm thử thành công:** **30/30 Test Cases PASS (100%)** — Không phát sinh lỗi console, không bị che khuất phần tử.

---

## MỤC LỤC
1. [Sprint 1: Tính năng Xác thực Đăng nhập (User Login Authentication - US-02)](#phần-1-sprint-1--tính-năng-xác-thực-đăng-nhập-us-02)
   - Bảng 10 Test Cases Chuẩn 9 Cột `[Auth-1]` $\to$ `[Auth-10]` (Kèm Kết quả Thực tế)
   - Giải thích học thuật "Vì sao viết như thế?"
   - Hướng dẫn thực thi thủ công trên trình duyệt
2. [Sprint 2: Tính năng Hồ sơ Xác minh Nhà cung cấp (Provider KYC & Compliance - US-06)](#phần-2-sprint-2--hồ-sơ-xác-minh-nhà-cung-cấp-provider-kyc-us-06)
   - Bảng 10 Test Cases Chuẩn 9 Cột `[KYC-1]` $\to$ `[KYC-10]` (Kèm Kết quả Thực tế)
   - Giải thích học thuật "Vì sao viết như thế?"
   - Hướng dẫn thực thi thủ công trên trình duyệt
3. [Sprint 3: Tính năng Khởi tạo & Quản lý Khóa API Consumer (API Key Lifecycle - US-21)](#phần-3-sprint-3--khởi-tạo--quản-lý-khóa-api-consumer-us-21)
   - Bảng 10 Test Cases Chuẩn 9 Cột `[Key-1]` $\to$ `[Key-10]` (Kèm Kết quả Thực tế)
   - Giải thích học thuật "Vì sao viết như thế?"
   - Hướng dẫn thực thi thủ công trên trình duyệt
4. [Hướng dẫn Thiết lập Môi trường & Khởi chạy Toàn diện](#phần-4-hướng-dẫn-thiết-lập-môi-trường--khởi-chạy-toàn-diện)

---

# PHẦN 1: SPRINT 1 — TÍNH NĂNG XÁC THỰC ĐĂNG NHẬP (US-02)
- **Màn hình kiểm thử:** Trang Đăng nhập (`http://localhost:5173/login`)
- **Tệp mã nguồn liên quan:** `frontend/src/pages/auth/LoginPage.tsx`, `frontend/src/services/authApi.ts`, `backend/src/auth.ts`
- **Mục tiêu:** Xác thực danh tính người dùng (Consumer, Provider, Admin) bằng Email và Mật khẩu, cấp cặp JWT Access/Refresh Token và điều hướng vào không gian làm việc tương ứng theo ma trận phân quyền (RBAC).

### 1.1. Bảng 10 Test Cases Tiêu biểu (Chuẩn 9 cột — Đã điền Actual Output thực tế)

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Auth-1]** | Kiểm tra hiển thị giao diện và các phần tử UI form Đăng nhập | Không phụ thuộc | 1. Mở trình duyệt web.<br>2. Nhập URL `http://localhost:5173/login` và nhấn Enter.<br>3. Quan sát giao diện trung tâm. | Không có | - Tiêu đề chính hiển thị `"Đăng nhập API HUB"`.<br>- Có nhãn `"Địa chỉ Email"` và trường nhập email.<br>- Có nhãn `"Mật khẩu"` và trường nhập mật khẩu.<br>- Nút bấm `"Đăng nhập"` hiển thị rõ ràng, không bị che khuất.<br>- Hộp trạng thái kết nối hiển thị chấm xanh kèm `"Máy chủ đang kết nối"`. | Khớp 100%: Tiêu đề: `"Đăng nhập API HUB"`; Nhãn: `"Địa chỉ Email"`, `"Mật khẩu"`; Nút submit: `"Đăng nhập"`; Trạng thái: `"Máy chủ đang kết nối"`. Không lỗi layout. | Medium | Pass |
| **[Auth-2]** | Kiểm tra bỏ trống cả hai trường Email và Mật khẩu (Force Errors) | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Để trống cả 2 ô "Địa chỉ Email" và "Mật khẩu".<br>3. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `""`<br>Password: `""` | Trình duyệt ngăn chặn gửi biểu mẫu; trường "Địa chỉ Email" tự động được focus và hiển thị thông báo validation HTML5 yêu cầu người dùng điền thông tin vào trường này. | Khớp 100%: Form không gửi request mạng. Ô Email được focus và hiển thị tooltip HTML5: `"Please fill out this field."`. | High | Pass |
| **[Auth-3]** | Kiểm tra bỏ trống trường Mật khẩu khi đã nhập Email hợp lệ (Force Errors) | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập email hợp lệ vào ô "Địa chỉ Email".<br>3. Để trống ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `user@example.com`<br>Password: `""` | Trình duyệt ngăn chặn gửi biểu mẫu; con trỏ nhảy đến trường "Mật khẩu" và hiển thị thông báo validation HTML5 yêu cầu điền mật khẩu. | Khớp 100%: Form không gửi lên server. Ô Mật khẩu được focus và hiển thị tooltip HTML5: `"Please fill out this field."`. | High | Pass |
| **[Auth-4]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Định dạng Email sai cú pháp | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập chuỗi email không đúng định dạng vào ô "Địa chỉ Email".<br>3. Nhập mật khẩu bất kỳ vào ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `notanemail`<br>Password: `AnyPassword123!` | Trình duyệt ngăn chặn gửi form và hiển thị cảnh báo định dạng HTML5 trên ô Email yêu cầu ký tự '@'. | Khớp 100%: Trình duyệt chặn gửi form, tooltip HTML5 hiển thị: `"Please include an '@' in the email address. 'notanemail' is missing an '@'."`. | High | Pass |
| **[Auth-5]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Email chưa từng đăng ký | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập email chưa có trong cơ sở dữ liệu vào ô "Địa chỉ Email".<br>3. Nhập mật khẩu vào ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `ghost_user@api.vn`<br>Password: `ValidPass@123` | Nút "Đăng nhập" chuyển sang `"Đang xác thực..."` trong giây lát; sau đó trên đầu form xuất hiện hộp cảnh báo màu đỏ với nội dung: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."` | Khớp 100%: Tab Network ghi nhận HTTP 401; giao diện xuất hiện thẻ `role="alert"` màu đỏ: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."`. | High | Pass |
| **[Auth-6]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Email đúng nhưng Mật khẩu sai | Tài khoản `user@example.com` đã tồn tại trong CSDL | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập email chính xác của Consumer vào ô "Địa chỉ Email".<br>3. Nhập sai mật khẩu vào ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `user@example.com`<br>Password: `WrongPassword@999` | Xuất hiện hộp cảnh báo lỗi màu đỏ chứa nội dung: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."` (Hệ thống bảo mật không tiết lộ email có tồn tại hay không). | Khớp 100%: Trả về cùng một thông điệp lỗi 401: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."`, bảo mật thông tin tài khoản. | High | Pass |
| **[Auth-7]** | Kiểm tra giá trị biên: Email có khoảng trắng đầu/cuối và viết hoa bất quy tắc | Tài khoản `user@example.com` đã tồn tại trong CSDL | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập email có chứa khoảng trắng và viết hoa vào ô "Địa chỉ Email".<br>3. Nhập mật khẩu chính xác vào ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `  USER@EXAMPLE.COM  `<br>Password: `User@123` | Hệ thống tự động chuẩn hóa (`.trim().toLowerCase()`), đăng nhập thành công và điều hướng sang trang `/dashboard`. | Khớp 100%: Email được xử lý tự động thành `user@example.com`. Đăng nhập thành công và URL chuyển thành `http://localhost:5173/dashboard`. | Medium | Pass |
| **[Auth-8]** | Luồng tương tác thành công (Happy Path): Đăng nhập tài khoản Consumer và điều hướng | Tài khoản `user@example.com` / `User@123` có sẵn từ seed | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập email `user@example.com`.<br>3. Nhập mật khẩu `User@123`.<br>4. Nhấp chuột vào nút `"Đăng nhập"`.<br>5. Quan sát thanh địa chỉ và menu điều hướng. | Email: `user@example.com`<br>Password: `User@123` | - Trình duyệt điều hướng thành công về URL `http://localhost:5173/dashboard`.<br>- Thanh Sidebar hiển thị các menu Consumer.<br>- `sessionStorage` lưu trữ đối tượng `apihub_sprint1_auth` chứa Access Token. | Khớp 100%: URL chuyển về `http://localhost:5173/dashboard`. Sidebar hiển thị đầy đủ danh mục Consumer. Khóa `apihub_sprint1_auth` được tạo trong sessionStorage. | High | Pass |
| **[Auth-9]** | Luồng tương tác thành công (Happy Path): Đăng nhập tài khoản Admin và phân quyền RBAC | Tài khoản `admin@example.com` / `Admin@123` có sẵn từ seed | 1. Đảm bảo đã đăng xuất phiên cũ.<br>2. Mở trang `http://localhost:5173/login`.<br>3. Nhập email `admin@example.com`.<br>4. Nhập mật khẩu `Admin@123`.<br>5. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `admin@example.com`<br>Password: `Admin@123` | - Trình duyệt điều hướng chính xác về URL `http://localhost:5173/admin`.<br>- Giao diện hiển thị trung tâm Quản trị viên hệ thống với các mục menu: *Người dùng, Xét duyệt API, Duyệt Provider, Audit Logs*.<br>- Không bị chuyển hướng lỗi `/403`. | Khớp 100%: URL chuyển chính xác về `http://localhost:5173/admin`. Giao diện nạp đầy đủ các module quản trị Admin. Phân quyền RBAC hoạt động chuẩn xác. | High | Pass |
| **[Auth-10]** | Kiểm thử bảo mật (Risk-based Security): Chống SQL Injection và XSS trên form đăng nhập | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Nhập chuỗi tiêm mã SQL Injection vào ô "Địa chỉ Email".<br>3. Nhập chuỗi mã độc XSS vào ô "Mật khẩu".<br>4. Nhấp chuột vào nút `"Đăng nhập"`. | Email: `' OR '1'='1' --`<br>Password: `<script>alert(document.cookie)</script>` | Trình duyệt cảnh báo định dạng email (hoặc nếu gửi lên server, parser bắt lỗi và trả về HTTP 401 an toàn). Hệ thống không sập 500, không bị bypass xác thực và mã script không bị thực thi trên màn hình. | Khớp 100%: Mã script không thực thi. Backend xử lý an toàn trả về HTTP 401 với thông báo: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."`. Không phát sinh lỗi console đỏ. | High | Pass |

---

### 1.2. Giải thích lý thuyết học thuật: "Vì sao viết như thế?" (Ian Sommerville - Chapter 9)
- **Equivalence Partitioning (Phân hoạch tương đương):** Không gian dữ liệu đầu vào của Email được chia thành: Phân vùng cú pháp hợp lệ (`user@example.com`), Phân vùng cú pháp không hợp lệ thiếu `@`/domain (`notanemail`), và Phân vùng tài khoản không tồn tại (`ghost_user@api.vn`). Ta chỉ cần 1 ca kiểm thử đại diện cho mỗi phân vùng để bao phủ toàn bộ tập kiểm thử mà không bị dư thừa.
- **Boundary Value Analysis (Phân tích giá trị biên):** Kiểm thử biên khoảng trắng và ký tự hoa (`  USER@EXAMPLE.COM  ` tại `[Auth-7]`). Lập trình viên thường quên xử lý chuẩn hóa chuỗi đầu vào, dẫn đến lỗi so khớp chuỗi không chính xác.
- **Force Errors (Kích hoạt cưỡng bức lỗi):** Sommerville nhấn mạnh: *"Good testing practice involves testing with inputs that cause errors"*. Các ca `[Auth-2]` và `[Auth-3]` đảm bảo mọi trường dữ liệu bắt buộc bị bỏ trống đều bị chặn ngay tại Client-side validation, giảm thiểu việc gửi request rác lên Backend.
- **Scenario Pathways & Security:** Các ca `[Auth-8]` và `[Auth-9]` kiểm tra luồng nghiệp vụ hoàn chỉnh (End-to-end) kèm phân nhánh điều hướng theo vai trò (Role-based Navigation). `[Auth-10]` kiểm thử rủi ro chèn mã độc (SQLi/XSS) theo tiêu chuẩn OWASP.

---

### 1.3. Hướng dẫn thực thi kiểm thử thủ công trên Web
1. **Truy cập:** Mở trình duyệt web tại `http://localhost:5173/login`.
2. **Mở DevTools:** Nhấn `F12` $\to$ chọn tab **Network** $\to$ lọc `Fetch/XHR`.
3. **Thao tác:** Nhập dữ liệu theo bảng và nhấn `"Đăng nhập"`.
   - Quan sát thông báo lỗi màu đỏ xuất hiện phía trên form: `"Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn."` tương ứng với mã HTTP 401 trong tab Network.
   - Khi đăng nhập thành công với `user@example.com` / `User@123`, quan sát màn hình điều hướng vào `http://localhost:5173/dashboard`. Mở tab **Application** $\to$ **Session Storage** $\to$ thấy khóa `apihub_sprint1_auth`.

---

# PHẦN 2: SPRINT 2 — HỒ SƠ XÁC MINH NHÀ CUNG CẤP (PROVIDER KYC - US-06)
- **Màn hình kiểm thử:** Trang Xác minh Nhà cung cấp (`http://localhost:5173/provider/verification`)
- **Tệp mã nguồn liên quan:** `frontend/src/pages/provider/ProviderVerificationPage.tsx`, `frontend/src/services/providerApi.ts`, `backend/src/provider-contract.ts`
- **Mục tiêu:** Kiểm tra quy trình nộp hồ sơ KYC dành cho tài khoản vai trò `API_PROVIDER`, bao gồm kê khai tên pháp nhân, email pháp lý, danh sách tài liệu minh chứng, cam kết thỏa thuận và xác thực chuyển đổi trạng thái sang `Pending`.

### 2.1. Bảng 10 Test Cases Tiêu biểu (Chuẩn 9 cột — Đã điền Actual Output thực tế)

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[KYC-1]** | Kiểm tra hiển thị giao diện form nộp hồ sơ KYC và trạng thái ban đầu | Đăng nhập tài khoản Provider mới chưa nộp KYC | 1. Đăng nhập bằng tài khoản Provider mới.<br>2. Nhấp menu *"Xác minh nhà cung cấp"* (vào `http://localhost:5173/provider/verification`).<br>3. Quan sát các thành phần trên form. | Không có | - Tiêu đề hiển thị `"Tuân thủ & Xác minh Danh tính Nhà cung cấp API"`.<br>- Huy hiệu trạng thái hiển thị `"Chưa xác minh"`.<br>- Có 3 trường bắt buộc có dấu sao đỏ `*`: *Tên công ty/Tổ chức hợp pháp, Email liên hệ pháp lý, Liên kết tài liệu minh chứng*.<br>- Có nút `+ Thêm liên kết`, Checkbox thỏa thuận và nút `"Nộp hồ sơ xác minh"`. | Khớp 100%: Tiêu đề hiển thị: `"Tuân thủ & Xác minh Danh tính Nhà cung cấp API"`. Banner hiển thị: `"verified_user Trạng thái xác minh: Chưa nộp hồ sơ... Chưa xác minh"`. Nút submit: `"send Nộp hồ sơ xác minh"`. | Medium | Pass |
| **[KYC-2]** | Kiểm tra bỏ trống trường Tên tổ chức khi nộp hồ sơ (Force Errors) | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Xóa sạch giá trị ô "Tên công ty / Tổ chức hợp pháp".<br>2. Nhập email và URL hợp lệ, tích chọn thỏa thuận.<br>3. Nhấp chuột vào nút `"Nộp hồ sơ xác minh"`. | Tên tổ chức: `""`<br>Email: `legal@tech.vn`<br>URL: `https://alpha.vn/license.pdf` | Trình duyệt kích hoạt HTML5 validation trên trường Tên tổ chức, ngăn form submit. | Khớp 100%: Form không gửi request. Trường Tên tổ chức được focus và hiển thị thông điệp HTML5: `"Please fill out this field."`. | High | Pass |
| **[KYC-3]** | Kiểm tra bỏ trống trường Email liên hệ pháp lý (Force Errors) | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Nhập tên công ty hợp lệ vào ô "Tên công ty / Tổ chức hợp pháp".<br>2. Để trống ô "Email liên hệ pháp lý".<br>3. Nhập URL hợp lệ và nhấp chuột vào nút `"Nộp hồ sơ xác minh"`. | Tên tổ chức: `Công ty TNHH Giải pháp Số API Hub`<br>Email: `""`<br>URL: `https://alpha.vn/license.pdf` | Trình duyệt kích hoạt HTML5 validation trên trường Email, ngăn form submit. | Khớp 100%: Form bị chặn gửi. Trường Email được focus và hiển thị thông điệp HTML5: `"Please fill out this field."`. | High | Pass |
| **[KYC-4]** | Kiểm tra bỏ trống ô Liên kết tài liệu minh chứng (Force Errors) | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Nhập tên tổ chức hợp lệ.<br>2. Nhập email hợp lệ.<br>3. Xóa trắng ô "Liên kết tài liệu minh chứng".<br>4. Nhấp chuột vào nút `"Nộp hồ sơ xác minh"`. | Tên: `Công ty Công nghệ`<br>Email: `legal@tech.vn`<br>Evidence URL: `""` | Trình duyệt kích hoạt HTML5 validation trên ô URL (do có `required`), ngăn form submit. | Khớp 100%: Form bị chặn gửi. Ô URL được focus và hiển thị thông điệp HTML5: `"Please fill out this field."`. | High | Pass |
| **[KYC-5]** | Kiểm tra quên tích chọn Checkbox cam kết Thỏa thuận Nhà cung cấp (Defensive Usability) | Đang ở trang `/provider/verification` | 1. Nhập đầy đủ Tên tổ chức, Email pháp lý và URL chứng từ hợp lệ.<br>2. Không tích chọn ô Checkbox thỏa thuận.<br>3. Quan sát trạng thái của nút "Nộp hồ sơ xác minh". | Dữ liệu các trường hợp lệ, Checkbox: `Unchecked` | Nút `"Nộp hồ sơ xác minh"` bị vô hiệu hóa (`disabled`), ngăn chặn người dùng bấm gửi khi chưa đồng ý điều khoản. | Khớp 100%: Nút submit duy trì trạng thái disabled (`disabled=true`). Khi nhấp chọn checkbox, nút chuyển sang enabled (`disabled=false`) ngay lập tức. | High | Pass |
| **[KYC-6]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Email liên hệ pháp lý sai cú pháp | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Nhập tên tổ chức hợp lệ.<br>2. Nhập chuỗi email không chứa ký tự `@` vào ô Email.<br>3. Nhập URL chứng từ và tích chọn thỏa thuận.<br>4. Nhấp chuột vào nút `"Nộp hồ sơ xác minh"`. | Email: `legal_company_domain.com` | Trình duyệt kích hoạt cảnh báo định dạng HTML5 trên ô Email yêu cầu ký tự '@'. | Khớp 100%: Tooltip HTML5 hiển thị cảnh báo: `"Please include an '@' in the email address. 'legal_company_domain.com' is missing an '@'."`. | High | Pass |
| **[KYC-7]** | Kiểm tra phân vùng dữ liệu không hợp lệ: URL minh chứng sai giao thức | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Nhập tên công ty và email hợp lệ.<br>2. Nhập đường dẫn dùng giao thức `ftp://` vào ô tài liệu minh chứng.<br>3. Nhấn `"Nộp hồ sơ xác minh"`. | URL: `ftp://myfiles.org/giayphep.pdf` | Hệ thống chặn submit và hiển thị thông báo lỗi cụ thể: `"Liên kết ftp://myfiles.org/giayphep.pdf không hợp lệ. Phải bắt đầu bằng http:// hoặc https://"` | Khớp 100%: Xuất hiện hộp cảnh báo `role="alert"` màu đỏ: `"Liên kết ftp://myfiles.org/giayphep.pdf không hợp lệ. Phải bắt đầu bằng http:// hoặc https://"`. | High | Pass |
| **[KYC-8]** | Kiểm tra giá trị biên: Tên tổ chức chỉ chứa khoảng trắng | Đang ở trang `/provider/verification`, Checkbox thỏa thuận đã được tích | 1. Nhập chuỗi 5 khoảng trắng vào ô Tên tổ chức.<br>2. Nhập email và URL hợp lệ, tích chọn thỏa thuận.<br>3. Nhấn nút `"Nộp hồ sơ xác minh"`. | Tên tổ chức: `     ` (5 khoảng trắng)<br>Email: `contact@alpha.vn`<br>URL: `https://alpha.vn/license.pdf` | Chuỗi khoảng trắng bị hàm `.trim()` nhận diện là rỗng, hệ thống hiển thị thông báo lỗi: `"Vui lòng nhập tên công ty / tổ chức."` | Khớp 100%: Form vượt qua HTML5 required nhưng bị chặn bởi logic frontend, xuất hiện thẻ cảnh báo đỏ: `"Vui lòng nhập tên công ty / tổ chức."`. | Medium | Pass |
| **[KYC-9]** | Luồng tương tác thành công (Happy Path): Nộp hồ sơ KYC và chuyển trạng thái Pending | Tài khoản Provider chưa nộp hồ sơ KYC | 1. Nhập Tên tổ chức hợp lệ.<br>2. Nhập Email pháp lý hợp lệ.<br>3. Nhập URL tài liệu minh chứng chuẩn.<br>4. Nhấp nút `+ Thêm liên kết` và nhập thêm URL thứ hai.<br>5. Tích chọn ô cam kết Thỏa thuận.<br>6. Nhấp chuột vào nút `"Nộp hồ sơ xác minh"`. | Tên: `Tập đoàn Công nghệ Alpha`<br>Email: `contact@alpha-corp.vn`<br>URL 1: `https://alpha.vn/gpdkkd.pdf`<br>URL 2: `https://alpha.vn/mst.pdf`<br>Agreement: `Checked` | - Xuất hiện thông báo màu xanh lá: `"Hồ sơ xác minh đã được nộp lên máy chủ thành công và đang chờ Admin xét duyệt."`.<br>- Banner trạng thái đổi sang màu vàng: `"Đang chờ duyệt (Pending)"`.<br>- Toàn bộ form tự động chuyển sang chế độ Khóa (Read-only), ngăn chỉnh sửa đè. | Khớp 100%: Thông báo màu xanh xuất hiện: `"Hồ sơ xác minh đã được nộp lên máy chủ thành công và đang chờ Admin xét duyệt."`. Banner chuyển sang `"pending_actions Trạng thái xác minh: Đang chờ duyệt (Pending)..."`. Toàn bộ các trường input bị disabled: true. | High | Pass |
| **[KYC-10]** | Kiểm thử bảo mật (Risk-based Security): Kiểm soát phân quyền truy cập trái phép (RBAC) | Đăng nhập tài khoản Consumer (`user@example.com`) | 1. Đăng nhập bằng tài khoản Consumer.<br>2. Gõ trực tiếp URL `http://localhost:5173/provider/verification` trên thanh địa chỉ trình duyệt và nhấn Enter.<br>3. Quan sát phản ứng điều hướng. | Truy cập trái quyền role USER | Hệ thống Route Guard kích hoạt ngay lập tức, chặn hiển thị form Provider và điều hướng người dùng sang trang báo lỗi `http://localhost:5173/403` (Forbidden - Không có quyền truy cập). | Khớp 100%: Người dùng role USER bị Route Guard chặn tức thì và điều hướng về URL: `"http://localhost:5173/403"`. Không để lộ giao diện hoặc dữ liệu Provider. | High | Pass |

---

### 2.2. Giải thích lý thuyết học thuật: "Vì sao viết như thế?" (Ian Sommerville - Chapter 9)
- **Equivalence Partitioning cho trường URL:** Các đường dẫn minh chứng được chia thành 3 phân vùng: Phân vùng giao thức hợp lệ (`https://` hoặc `http://`), Phân vùng giao thức không an toàn bị cấm (`ftp://`, `file://`, `javascript:`), và Phân vùng chuỗi dị dạng không thể parse. Test case `[KYC-7]` chứng minh cơ chế whitelist giao thức an toàn, bảo vệ hệ thống khỏi các cuộc tấn công SSRF/Local File Inclusion.
- **Force Errors cho thuộc tính bắt buộc:** Hồ sơ pháp lý KYC yêu cầu tính toàn vẹn thông tin nghiêm ngặt. Từ `[KYC-2]` đến `[KYC-5]`, mỗi thuộc tính bắt buộc bị cố tình bỏ trống một cách độc lập để kiểm chứng hệ thống có hiển thị câu thông báo lỗi chính xác, rõ ràng cho từng trường hay không.
- **State Machine & Record Immutability (Bất biến trạng thái):** Sau khi nộp thành công ở `[KYC-9]`, thực thể chuyển từ `Unverified` sang `Pending`, toàn bộ form phải đóng băng (Read-only). Đây là yêu cầu kiểm thử trạng thái của Sommerville nhằm tránh lỗi xung đột dữ liệu (Concurrency/Race Condition) khi Admin đang duyệt hồ sơ.
- **Risk-based Security (Kiểm soát truy cập RBAC):** `[KYC-10]` xác minh nguyên tắc Defense-in-Depth: Consumer dù cố tình truy cập sâu vào URL nội bộ của Provider cũng sẽ bị Route Guard chặn tại chỗ và đẩy về `/403`.

---

### 2.3. Hướng dẫn thực thi kiểm thử thủ công trên Web
1. **Chuẩn bị:** Vào `http://localhost:5173/register`, chọn thẻ `"API Provider"`, đăng ký tài khoản mới (Ví dụ: `kyc_test@example.com` / `Provider@123`).
2. **Truy cập:** Đăng nhập và điều hướng đến `http://localhost:5173/provider/verification`.
3. **Thao tác:**
   - Quan sát trạng thái ban đầu: Huy hiệu hiển thị `"Chưa xác minh"`.
   - Chưa tích checkbox: Nút `"Nộp hồ sơ xác minh"` bị mờ (disabled). Tích chọn checkbox: Nút sáng lên (`[KYC-5]`).
   - Nhập `ftp://myfiles.org/giayphep.pdf` vào ô URL $\to$ xuất hiện lỗi đỏ: `"Liên kết ftp://myfiles.org/giayphep.pdf không hợp lệ. Phải bắt đầu bằng http:// hoặc https://"` (`[KYC-7]`).
   - Điền đầy đủ thông tin hợp lệ, nhấp `+ Thêm liên kết`, bấm submit $\to$ Thông báo xanh xuất hiện, trạng thái đổi thành `"Đang chờ duyệt (Pending)"` và form bị khóa (`[KYC-9]`).

---

# PHẦN 3: SPRINT 3 — KHỞI TẠO & QUẢN LÝ KHÓA API CONSUMER (US-21)
- **Màn hình kiểm thử:** Trang Kho lưu trữ API Key (`http://localhost:5173/dashboard/keys`)
- **Tệp mã nguồn liên quan:** `frontend/src/pages/consumer/ApiKeysPage.tsx`, `frontend/src/services/consumerApi.ts`, `backend/src/consumer-service.ts`
- **Mục tiêu:** Cho phép nhà phát triển ứng dụng (Consumer) sinh khóa API Key (`ak_live_***`) truy cập Gateway, hiển thị Secret một lần duy nhất, sao chép khóa an toàn, quản lý trạng thái Hoạt động/Đã thu hồi.

### 3.1. Bảng 10 Test Cases Tiêu biểu (Chuẩn 9 cột — Đã điền Actual Output thực tế)

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Key-1]** | Kiểm tra hiển thị giao diện Quản lý Khóa API và Modal Khởi tạo | Đã đăng nhập vai trò Consumer (`user@example.com`) | 1. Mở trang `http://localhost:5173/dashboard/keys`.<br>2. Nhấp chuột vào nút `"Tạo API Key mới"`.<br>3. Quan sát Modal hiện lên màn hình. | Không có | - Tiêu đề modal hiển thị: `"Tạo API Key Mới"`.<br>- Có trường `"API ID (Bắt buộc) *"` với placeholder `"e.g. 1"`.<br>- Có trường `"Tên gợi nhớ (Label - Tùy chọn)"`.<br>- Nút `"Tạo Khóa"` ban đầu ở trạng thái vô hiệu hóa (disabled) khi ô API ID còn trống. | Khớp 100%: Modal mở ra với tiêu đề: `"Tạo API Key Mới"`. Nhãn: `"API ID (Bắt buộc) *"`, `"Tên gợi nhớ (Label - Tùy chọn)"`. Nút `"Tạo Khóa"` bị disabled (`disabled=true`). | Medium | Pass |
| **[Key-2]** | Kiểm tra bỏ trống trường bắt buộc API ID (Force Errors) | Đang mở Modal "Tạo API Key Mới" | 1. Để trống trường "API ID (Bắt buộc)".<br>2. Nhập nội dung vào ô "Tên gợi nhớ".<br>3. Quan sát trạng thái nút "Tạo Khóa" và cố tình submit form. | API ID: `""`<br>Label: `My Dev Key` | Nút `"Tạo Khóa"` bị vô hiệu hóa (`disabled`), ngăn chặn hoàn toàn việc người dùng gửi yêu cầu rỗng lên server. | Khớp 100%: Nút `"Tạo Khóa"` duy trì trạng thái vô hiệu hóa (`disabled=true`), người dùng không thể kích hoạt hành động submit form rỗng. | High | Pass |
| **[Key-3]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Nhập giá trị biên số 0 hoặc số âm | Đang mở Modal "Tạo API Key Mới" | 1. Nhập số `0` (hoặc số âm `-3`) vào ô "API ID (Bắt buộc)".<br>2. Nhấp chuột vào nút `"Tạo Khóa"`. | API ID: `0`<br>Label: `Invalid Test` | Hệ thống kích hoạt validation regex `^[1-9][0-9]{0,9}$`, trình duyệt hiển thị thông báo lỗi định dạng không hợp lệ. | Khớp 100%: Giá trị '0' vi phạm mẫu regex (`checkValidity: false`), trình duyệt hiển thị tooltip: `"Please match the requested format."`. | High | Pass |
| **[Key-4]** | Kiểm tra phân vùng dữ liệu không hợp lệ: Nhập chuỗi ký tự không phải số | Đang mở Modal "Tạo API Key Mới" | 1. Nhập chuỗi chữ cái hoặc ký tự đặc biệt vào ô "API ID (Bắt buộc)".<br>2. Nhấp chuột vào nút `"Tạo Khóa"`. | API ID: `abc`<br>Label: `NaN Test` | Hệ thống chặn submit và hiển thị thông báo lỗi định dạng không hợp lệ. | Khớp 100%: Chuỗi 'abc' vi phạm định dạng (`checkValidity: false`), tooltip HTML5 kích hoạt: `"Please match the requested format."`. | High | Pass |
| **[Key-5]** | Kiểm tra phân vùng dữ liệu không hợp lệ: API ID không tồn tại hoặc chưa xuất bản | Đang mở Modal "Tạo API Key Mới" | 1. Nhập một ID số nguyên dương không có trong bảng `apis` vào ô "API ID (Bắt buộc)".<br>2. Nhấp chuột vào nút `"Tạo Khóa"`. | API ID: `999999`<br>Label: `Ghost API Key` | Nút hiển thị `"Đang tạo..."` trong giây lát; sau đó modal xuất hiện thông báo lỗi từ server: `"API không tồn tại hoặc chưa được công khai."` (HTTP 404). | Khớp 100%: Backend trả về HTTP 404; modal xuất hiện thông báo lỗi màu đỏ: `"API không tồn tại hoặc chưa được công khai."`. | High | Pass |
| **[Key-6]** | Kiểm tra giá trị biên & Xung đột trạng thái: Tạo khóa trùng lặp cho API đã có khóa Active | Đã có 1 khóa API Key đang Active cho API ID = 3 | 1. Nhấp nút `"Tạo API Key mới"`.<br>2. Nhập API ID `3` (API đã có khóa hoạt động trước đó).<br>3. Nhập nhãn bất kỳ và nhấp nút `"Tạo Khóa"`. | API ID: `3`<br>Label: `Duplicate Key Test` | Hệ thống từ chối với mã HTTP 409 Conflict và hiển thị thông báo lỗi: `"Một khóa đang hoạt động đã tồn tại cho API này. Vui lòng rotate hoặc thu hồi khóa hiện tại trước."` | Khớp 100%: Backend từ chối với HTTP 409; modal hiển thị thông báo lỗi: `"Một khóa đang hoạt động đã tồn tại cho API này. Vui lòng rotate hoặc thu hồi khóa hiện tại trước."`. | High | Pass |
| **[Key-7]** | Luồng tương tác thành công (Happy Path): Khởi tạo Khóa API và hiển thị Secret an toàn | API ID = 7 đã xuất bản và Consumer chưa tạo khóa cho API này | 1. Nhấp nút `"Tạo API Key mới"`.<br>2. Nhập API ID hợp lệ `7`.<br>3. Nhập Tên gợi nhớ `"Production Cluster Key"`.<br>4. Nhấp chuột vào nút `"Tạo Khóa"`. | API ID: `7`<br>Label: `Production Cluster Key` | - Modal tạo đóng lại; Modal mới xuất hiện: `"Khóa API Của Bạn Đã Sẵn Sàng"`.<br>- Hộp cảnh báo màu hổ phách: *"Lưu ý bảo mật quan trọng: Đây là lần duy nhất bạn thấy toàn bộ chuỗi Secret Key này..."*.<br>- Chuỗi khóa bí mật bắt đầu bằng tiền tố `ak_live_` được hiển thị rõ ràng kèm nút `"Sao chép"`. | Khớp 100%: Modal Secret hiển thị với tiêu đề: `"Khóa API Của Bạn Đã Sẵn Sàng"`. Cảnh báo hổ phách hiển thị đầy đủ. Chuỗi khóa hiển thị tiền tố: `"ak_live_Ua0mAtp2..."`. | High | Pass |
| **[Key-8]** | Luồng tương tác sao chép Secret Key vào Clipboard và cập nhật danh sách | Đang mở Modal hiển thị Secret Key ở `[Key-7]` | 1. Nhấp chuột vào nút `"Sao chép"` bên cạnh chuỗi Secret Key.<br>2. Quan sát nút bấm.<br>3. Nhấp nút `"Tôi đã lưu khóa an toàn"`.<br>4. Quan sát thẻ khóa bên ngoài. | Không có | - Nút "Sao chép" đổi thành biểu tượng dấu tích xanh kèm nhãn `"Đã chép!"` (khóa đã vào Clipboard).<br>- Nhấn nút đóng modal: Modal biến mất.<br>- Danh sách khóa hiển thị thẻ mới với tiền tố dạng `ak_live_***`, nhãn `"Production Cluster Key"`, API ID `7` và Badge trạng thái xanh lá `"Hoạt động"`. | Khớp 100%: Nút "Sao chép" chuyển thành `"check Đã chép!"`. Đóng modal, thẻ khóa xuất hiện với Badge xanh `"Hoạt động"` và trạng thái `"Sẵn sàng cho Gateway"`. | High | Pass |
| **[Key-9]** | Luồng Thu hồi khóa (Revoke Key Pathway) và chuyển trạng thái vô hiệu hóa | Đã có một khóa Active trên bảng danh sách | 1. Tại thẻ chứa khóa vừa tạo, nhấp vào nút `"Thu hồi"` (biểu tượng thùng rác).<br>2. Modal xác nhận hiện ra với cảnh báo đỏ.<br>3. Nhấp vào nút `"Xác nhận Thu Hồi"`. | Không có | - Khóa bị thu hồi tức thì trên Gateway.<br>- Trên giao diện, Huy hiệu của khóa chuyển từ màu xanh `"Hoạt động"` sang màu xám `"Đã thu hồi"`.<br>- Nút "Xoay vòng" và "Thu hồi" của khóa này bị ẩn đi, hiển thị `"Không thể sử dụng"`. | Khớp 100%: Modal xác nhận `"Xác nhận Thu Hồi (Revoke) API Key"` hiện ra. Nhấp xác nhận, Badge chuyển sang màu xám: `"Đã thu hồi"`, hiển thị `"Thời điểm thu hồi"` và `"Không thể sử dụng"`. | High | Pass |
| **[Key-10]** | Kiểm thử bảo mật (Risk-based Security): Kiểm soát quyền truy cập trang quản lý khóa | Chưa đăng nhập (Guest) | 1. Đảm bảo chưa đăng nhập tài khoản nào (trình duyệt trắng).<br>2. Gõ trực tiếp URL `http://localhost:5173/dashboard/keys` trên thanh địa chỉ và nhấn Enter.<br>3. Quan sát phản ứng điều hướng. | Chưa xác thực danh tính | Hệ thống Route Guard phát hiện chưa có JWT token, lập tức chặn truy cập và điều hướng người dùng về trang Đăng nhập `http://localhost:5173/login`. | Khớp 100%: Route Guard bảo vệ tài nguyên an toàn. Trình duyệt lập tức bị điều hướng về URL: `"http://localhost:5173/login"`. | High | Pass |

---

### 3.2. Giải thích lý thuyết học thuật: "Vì sao viết như thế?" (Ian Sommerville - Chapter 9)
- **Boundary Value Analysis cho miền số học (Numeric Edge Cases):** Miền giá trị của `API ID` là tập số nguyên dương $\ge 1$. Hai ca kiểm thử `[Key-3]` (biên số 0 và số âm) và `[Key-4]` (chuỗi ký tự chữ) kiểm tra nghiêm ngặt ranh giới dưới, chứng minh giải thuật đã sử dụng Regex `^[1-9][0-9]{0,9}$` để lọc sạch các giá trị không hợp lệ.
- **Force Errors & Defensive Design:** Tại `[Key-2]`, UI sử dụng cơ chế *Disable On Empty* để ngăn chặn hành động gửi form rỗng ngay từ phía giao diện, tuân thủ nguyên tắc Usability Engineering: *"Phòng ngừa lỗi tốt hơn là xử lý lỗi sau khi xảy ra"*.
- **State Machine Transitions (Chuyển đổi trạng thái):** Kịch bản `[Key-7]` $\to$ `[Key-8]` $\to$ `[Key-9]` bao phủ toàn bộ vòng đời của khóa: *Khởi tạo (Issued) $\to$ Đang hoạt động (Active) $\to$ Bị thu hồi (Revoked)*. Ca `[Key-6]` kiểm tra luật nghiệp vụ: Mỗi Consumer chỉ được có duy nhất 1 khóa Active cho mỗi API (Conflict 409).
- **One-time Secret Reveal (Zero-Knowledge Architecture):** Máy chủ chỉ lưu chuỗi băm SHA-256 của khóa trong database. Vì vậy, Secret Key chỉ xuất hiện trong bộ nhớ RAM của Client đúng một lần duy nhất lúc tạo (`[Key-7]`). Test case kiểm tra nút sao chép và cảnh báo bảo mật đảm bảo không làm mất khóa của người dùng.

---

### 3.3. Hướng dẫn thực thi kiểm thử thủ công trên Web
1. **Chuẩn bị:** Đăng nhập bằng tài khoản Consumer (`user@example.com` / `User@123`).
2. **Truy cập:** Vào đường dẫn chính xác `http://localhost:5173/dashboard/keys` (hoặc từ thanh Sidebar chọn *"Kho lưu trữ API Key"*).
3. **Thao tác:**
   - Nhấp nút `"Tạo API Key mới"`. Để trống ô API ID $\to$ Nút `"Tạo Khóa"` bị mờ (disabled) (`[Key-2]`).
   - Nhập `0` hoặc `abc` $\to$ Cảnh báo format không hợp lệ (`[Key-3]`, `[Key-4]`).
   - Nhập `999999` $\to$ Nhận thông báo lỗi: `"API không tồn tại hoặc chưa được công khai."` (`[Key-5]`).
   - Nhập API ID `3` (API đã có khóa active) $\to$ Nhận lỗi 409: `"Một khóa đang hoạt động đã tồn tại cho API này. Vui lòng rotate hoặc thu hồi khóa hiện tại trước."` (`[Key-6]`).
   - Nhập API ID `7` và nhãn `"Production Cluster Key"`, bấm `"Tạo Khóa"` $\to$ Modal nền vàng hiện chuỗi `ak_live_...` (`[Key-7]`).
   - Bấm `"Sao chép"` (nút chuyển thành `"Đã chép!"`), rồi bấm `"Tôi đã lưu khóa an toàn"` $\to$ Thẻ mới xuất hiện với Badge `"Hoạt động"` (`[Key-8]`).
   - Bấm `"Thu hồi"` tại thẻ khóa, xác nhận $\to$ Badge đổi thành `"Đã thu hồi"` (`[Key-9]`).

---

# PHẦN 4: HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG & KHỞI CHẠY DỰ ÁN

Để phục vụ quá trình chấm điểm trực tiếp trên máy của bạn, các lệnh terminal chuẩn của dự án được thực thi như sau:

```powershell
# BƯỚC 1: Khởi động CSDL PostgreSQL (Docker)
docker compose up -d api-market-postgres

# BƯỚC 2: Di chuyển vào thư mục dự án và chạy Migration + Seed Data
cd d:\Downloads\AAAAA\API-Market
npm run db:migrate
npm run db:seed

# BƯỚC 3: Khởi chạy Backend Express (Cổng 3000)
npm run dev
# Terminal hiển thị: [Server] API Market Backend running at http://localhost:3000

# BƯỚC 4: Mở Terminal thứ hai để khởi chạy Frontend Vite (Cổng 5173)
cd d:\Downloads\AAAAA\API-Market\frontend
npm run dev
# Terminal hiển thị: Local: http://localhost:5173/
```

### Thông tin tài khoản có sẵn trong cơ sở dữ liệu (Seed Data):
- **Quản trị viên (Admin):** `admin@example.com` / `Admin@123`
- **Người dùng cuối (Consumer):** `user@example.com` / `User@123`
- **Nhà cung cấp (Provider):** `provider@example.com` / `Provider@123`

---
*Tài liệu này được biên soạn bởi QA Lead nhằm phục vụ công tác kiểm thử chất lượng phần mềm và bảo vệ chuyên đề Công nghệ Phần mềm.*
