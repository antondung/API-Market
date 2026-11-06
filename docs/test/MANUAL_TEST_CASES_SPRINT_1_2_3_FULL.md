# TỔNG TẬP BỘ TEST CASES TOÀN DIỆN SPRINT 1, 2, 3 (MANUAL UI TESTING)
## MÔN HỌC: CÔNG NGHỆ PHẦN MỀM (THEO GIÁO TRÌNH IAN SOMMERVILLE - CHAPTER 9: SOFTWARE TESTING)

> **Dự án:** Sàn Giao dịch & Cổng Quản lý API (API Marketplace & Management Platform)
> **Người thực hiện:** QA Lead & Giảng viên Công nghệ Phần mềm
> **Phiên bản:** 3.0 Final (Bao phủ 100% User Stories của Sprint 1, Sprint 2 và Sprint 3)
> **Chuẩn thiết kế:** Ian Sommerville (Software Testing: Unit/Component, Integration, System, Equivalence Partitioning, Boundary Value Analysis, Force Errors, State Transition, Risk-based Security, RBAC)
> **Định dạng bảng:** 9 cột chuẩn nghiệp vụ lớp học:
> `| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |`

---

## MỤC LỤC TỔNG THỂ

### [PHẦN 1: SPRINT 1 — XÁC THỰC, PHÂN QUYỀN & QUẢN TRỊ NGƯỜI DÙNG](#phần-1-sprint-1--xác-thực-phân-quyền--quản-trị-người-dùng)
- **Module 1 (US-01):** Đăng ký tài khoản người dùng (User Registration) `[Reg-1]` $\to$ `[Reg-8]`
- **Module 2 (US-02):** Xác thực Đăng nhập & Đăng xuất (Authentication & Session) `[Auth-1]` $\to$ `[Auth-8]`
- **Module 3 (US-03):** Phân quyền truy cập & Route Guard (RBAC Protection) `[RBAC-1]` $\to$ `[RBAC-6]`
- **Module 4 (US-04):** Quản trị viên Quản lý Người dùng (Admin User Management) `[User-1]` $\to$ `[User-6]`

### [PHẦN 2: SPRINT 2 — QUY TRÌNH NHÀ CUNG CẤP & XÉT DUYỆT XUẤT BẢN API](#phần-2-sprint-2--quy-trình-nhà-cung-cấp--xét-duyệt-xuất-bản-api)
- **Module 5 (US-06):** Hồ sơ Xác minh Nhà cung cấp (Provider KYC & Compliance) `[KYC-1]` $\to$ `[KYC-8]`
- **Module 6 (US-07):** Admin Phê duyệt & Từ chối KYC (Provider KYC Moderation) `[RevKYC-1]` $\to$ `[RevKYC-6]`
- **Module 7 (US-08):** Khai báo Pháp lý & Xác minh Tên miền (Legal & Domain Verification) `[Legal-1]` $\to$ `[Legal-6]`
- **Module 8 (US-09 & US-10):** Quản lý API, Endpoint & Soạn thảo OpenAPI Docs `[ApiDoc-1]` $\to$ `[ApiDoc-8]`
- **Module 9 (US-11):** Cấu hình Gói cước Dịch vụ (API Pricing Plans) `[Plan-1]` $\to$ `[Plan-6]`
- **Module 10 (US-12 & US-13):** Nộp duyệt & Xuất bản API (Readiness & Publishing) `[Pub-1]` $\to$ `[Pub-8]`
- **Module 11 (US-14):** Quản lý Nhật ký Kiểm toán (Admin Audit Logs) `[Audit-1]` $\to$ `[Audit-5]`

### [PHẦN 3: SPRINT 3 — SÀN THƯƠNG MẠI, TIÊU THỤ API & CỔNG GATEWAY](#phần-3-sprint-3--sàn-thương-mại-tiêu-thụ-api--cổng-gateway)
- **Module 12 (US-16):** Khám phá, Tìm kiếm & Lọc Marketplace (Marketplace Discovery) `[Market-1]` $\to$ `[Market-8]`
- **Module 13 (US-17):** Chi tiết API & Tài liệu Công khai (API Detail & Public Docs) `[Detail-1]` $\to$ `[Detail-6]`
- **Module 14 (US-18):** Thử nghiệm Trực quan (API Playground) & Chống SSRF `[Play-1]` $\to$ `[Play-8]`
- **Module 15 (US-19):** Dùng thử API & Hạn ngạch Sandbox (Try Before Subscribe) `[Try-1]` $\to$ `[Try-6]`
- **Module 16 (US-21):** Khởi tạo & Quản lý Khóa API (API Key Lifecycle Management) `[Key-1]` $\to$ `[Key-8]`
- **Module 17 (US-22):** Cổng định tuyến API Gateway (Gateway Routing Framework) `[Gate-1]` $\to$ `[Gate-6]`
- **Module 18 (US-15):** Báo cáo Vi phạm & Kiểm duyệt API (Report & Moderation) `[Rep-1]` $\to$ `[Rep-6]`
- **Module 19 (US-05):** Quản lý Hồ sơ Cá nhân & Bảo mật (User Profile & Security) `[Prof-1]` $\to$ `[Prof-6]`

---

# PHẦN 1: SPRINT 1 — XÁC THỰC, PHÂN QUYỀN & QUẢN TRỊ NGƯỜI DÙNG

## MODULE 1 (US-01): ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG (USER REGISTRATION)
- **Đường dẫn màn hình:** `http://localhost:5173/register`
- **Mã nguồn liên quan:** `frontend/src/pages/auth/RegisterPage.tsx`, `backend/src/auth.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Reg-1]** | Kiểm tra hiển thị đầy đủ các phần tử UI của Form Đăng ký | Không phụ thuộc | 1. Mở trình duyệt web.<br>2. Nhập URL `http://localhost:5173/register` và nhấn Enter.<br>3. Quan sát các thành phần trên màn hình. | Không có | - Thẻ chọn Role: "API Consumer" và "API Provider".<br>- Có các nhãn và ô nhập: "Tên hiển thị", "Địa chỉ Email", "Mật khẩu", "Xác nhận mật khẩu".<br>- Nút bấm "Đăng ký tài khoản" hiển thị rõ, click được. | Khớp 100%: Giao diện hiển thị đầy đủ thẻ chọn vai trò, 4 trường thông tin bắt buộc và nút đăng ký. | Medium | Pass |
| **[Reg-2]** | Kiểm tra bỏ trống toàn bộ các trường khi đăng ký (Force Errors) | Không phụ thuộc | 1. Truy cập `http://localhost:5173/register`.<br>2. Để trống cả 4 ô thông tin.<br>3. Nhấp chuột vào nút "Đăng ký tài khoản". | Không có | Trình duyệt chặn gửi form; trường "Tên hiển thị" hoặc trường đầu tiên tự động focus và hiện thông điệp HTML5: "Please fill out this field." | Khớp 100%: Form bị chặn tại Client; HTML5 tooltip hiện: "Please fill out this field.". | High | Pass |
| **[Reg-3]** | Kiểm tra phân vùng tương đương: Email sai định dạng cú pháp | Không phụ thuộc | 1. Nhập tên: "Nguyễn Văn A".<br>2. Nhập email: `invalid-email-syntax` vào ô Email.<br>3. Nhập mật khẩu hợp lệ: `Password@123`.<br>4. Nhấp nút "Đăng ký tài khoản". | Email: `invalid-email-syntax`<br>Mật khẩu: `Password@123` | Trình duyệt chặn gửi form; ô Email kích hoạt cảnh báo HTML5: "Please include an '@' in the email address...". | Khớp 100%: Trình duyệt chặn gửi; tooltip HTML5 thông báo thiếu ký tự '@'. | High | Pass |
| **[Reg-4]** | Kiểm tra phân tích giá trị biên (BVA): Mật khẩu dưới độ dài tối thiểu (< 12 ký tự) | Không phụ thuộc | 1. Nhập tên và email hợp lệ.<br>2. Nhập mật khẩu 11 ký tự vào cả 2 ô mật khẩu.<br>3. Nhấp nút "Đăng ký tài khoản". | Mật khẩu: `Pass123456!` (11 ký tự) | Hệ thống chặn submit và xuất hiện thông báo lỗi: "Mật khẩu phải chứa ít nhất 12 ký tự." | Khớp 100%: Alert đỏ xuất hiện: "Mật khẩu phải chứa ít nhất 12 ký tự." | High | Pass |
| **[Reg-5]** | Kiểm tra biên mật khẩu không khớp nhau (Password Mismatch) | Không phụ thuộc | 1. Nhập tên và email hợp lệ.<br>2. Nhập ô Mật khẩu: `Password@1234`.<br>3. Nhập ô Xác nhận mật khẩu: `Password@9999`.<br>4. Nhấp nút "Đăng ký tài khoản". | Mật khẩu 1: `Password@1234`<br>Mật khẩu 2: `Password@9999` | Hệ thống chặn submit và hiển thị cảnh báo: "Mật khẩu xác nhận không khớp." | Khớp 100%: Alert đỏ hiển thị: "Mật khẩu xác nhận không khớp." | High | Pass |
| **[Reg-6]** | Kiểm tra tính duy nhất: Đăng ký với Email đã tồn tại trong CSDL | Tài khoản `user@example.com` đã tồn tại từ seed | 1. Nhập tên: "Người Dùng Mới".<br>2. Nhập email: `user@example.com`.<br>3. Nhập mật khẩu hợp lệ 12 ký tự.<br>4. Nhấp nút "Đăng ký tài khoản". | Email: `user@example.com`<br>Mật khẩu: `Password@1234` | Hệ thống trả về lỗi HTTP 409 Conflict; trên màn hình hiển thị alert đỏ: "Email này đã được đăng ký." | Khớp 100%: Server trả về 409 EMAIL_EXISTS; giao diện hiển thị: "Email này đã được đăng ký." | High | Pass |
| **[Reg-7]** | Luồng tương tác thành công (Happy Path): Đăng ký tài khoản Consumer mới | Email chưa từng tồn tại | 1. Chọn role "API Consumer".<br>2. Nhập Tên: "Trần Anh Quân".<br>3. Nhập Email: `anhquan_test@gmail.com`.<br>4. Nhập Mật khẩu: `ValidPassword@123`.<br>5. Nhấp nút "Đăng ký tài khoản". | Tên: `Trần Anh Quân`<br>Email: `anhquan_test@gmail.com`<br>Pass: `ValidPassword@123` | - Đăng ký thành công (HTTP 201).<br>- Hệ thống hiển thị thông báo thành công và tự động điều hướng sang trang Đăng nhập `/login`. | Khớp 100%: Tạo tài khoản thành công; URL chuyển hướng sang `http://localhost:5173/login`. | High | Pass |
| **[Reg-8]** | Kiểm thử bảo mật (Risk-based Security): Chống XSS trên trường Tên hiển thị | Không phụ thuộc | 1. Nhập ô Tên: `<script>alert('XSS')</script>`.<br>2. Nhập email mới và mật khẩu hợp lệ.<br>3. Nhấp nút "Đăng ký tài khoản". | Tên: `<script>alert('XSS')</script>`<br>Email: `xss_user@test.vn`<br>Pass: `ValidPass@123` | Hệ thống escape dữ liệu HTML, không thực thi popup mã độc; lưu chuỗi text an toàn hoặc đăng ký bình thường. | Khớp 100%: Không phát sinh hộp thoại popup Javascript; mã độc được xử lý an toàn dạng chuỗi văn bản. | High | Pass |

---

## MODULE 2 (US-02): XÁC THỰC ĐĂNG NHẬP & PHIÊN LÀM VIỆC (AUTHENTICATION & SESSION)
- **Đường dẫn màn hình:** `http://localhost:5173/login`
- **Mã nguồn liên quan:** `frontend/src/pages/auth/LoginPage.tsx`, `backend/src/auth.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Auth-1]** | Kiểm tra hiển thị giao diện form Đăng nhập | Không phụ thuộc | 1. Mở trang `http://localhost:5173/login`.<br>2. Quan sát giao diện trung tâm. | Không có | - Tiêu đề: "Đăng nhập API HUB".<br>- Có 2 nhãn và trường: "Địa chỉ Email", "Mật khẩu".<br>- Nút submit: "Đăng nhập".<br>- Trạng thái server: "Máy chủ đang kết nối". | Khớp 100%: Hiển thị chính xác các nhãn, trường nhập và nút đăng nhập không bị che khuất. | Medium | Pass |
| **[Auth-2]** | Kiểm tra bỏ trống cả hai trường Email và Mật khẩu (Force Errors) | Không phụ thuộc | 1. Để trống cả 2 ô.<br>2. Nhấp nút "Đăng nhập". | Email: `""`<br>Pass: `""` | Trình duyệt chặn gửi; ô Email tự động focus và hiện thông điệp HTML5: "Please fill out this field." | Khớp 100%: Trình duyệt chặn submit; focus ô Email kèm tooltip HTML5. | High | Pass |
| **[Auth-3]** | Kiểm tra phân vùng tương đương: Tài khoản email không tồn tại | Không phụ thuộc | 1. Nhập email ma chưa đăng ký.<br>2. Nhập mật khẩu bất kỳ.<br>3. Nhấp nút "Đăng nhập". | Email: `ghost_user@api.vn`<br>Pass: `AnyPass@123` | Server trả về HTTP 401; hiển thị hộp cảnh báo màu đỏ: "Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn." | Khớp 100%: HTTP 401; hiển thị đúng câu thông báo lỗi bảo mật không lộ email. | High | Pass |
| **[Auth-4]** | Kiểm tra phân vùng tương đương: Email đúng nhưng sai mật khẩu | Tài khoản `user@example.com` đã có trong DB | 1. Nhập email: `user@example.com`.<br>2. Nhập sai mật khẩu: `WrongPass@999`.<br>3. Nhấp nút "Đăng nhập". | Email: `user@example.com`<br>Pass: `WrongPass@999` | Trả về cùng một thông báo lỗi 401: "Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn." | Khớp 100%: Thông báo lỗi nhất quán với test case [Auth-3], đảm bảo an ninh thông tin. | High | Pass |
| **[Auth-5]** | Kiểm tra giá trị biên: Email có khoảng trắng đầu/cuối và viết hoa | Tài khoản `user@example.com` đã có trong DB | 1. Nhập email có khoảng trắng và viết hoa.<br>2. Nhập đúng mật khẩu `User@123`.<br>3. Nhấp nút "Đăng nhập". | Email: `  USER@EXAMPLE.COM  `<br>Pass: `User@123` | Hệ thống tự động trim và lowercase email; đăng nhập thành công vào `/dashboard`. | Khớp 100%: Đăng nhập thành công và URL chuyển thành `http://localhost:5173/dashboard`. | Medium | Pass |
| **[Auth-6]** | Luồng tương tác thành công (Happy Path): Đăng nhập Consumer | Tài khoản `user@example.com` / `User@123` có sẵn | 1. Nhập `user@example.com`.<br>2. Nhập `User@123`.<br>3. Nhấp nút "Đăng nhập".<br>4. Quan sát URL và thanh điều hướng. | Email: `user@example.com`<br>Pass: `User@123` | - Trình duyệt điều hướng sang `/dashboard`.<br>- Sidebar nạp các mục menu của Consumer.<br>- `sessionStorage` lưu đối tượng `apihub_sprint1_auth`. | Khớp 100%: URL chuyển về `/dashboard`; token được lưu an toàn trong sessionStorage. | High | Pass |
| **[Auth-7]** | Luồng Đăng xuất và hủy phiên làm việc (Logout Pathway) | Đang đăng nhập tài khoản Consumer | 1. Nhấp vào ảnh đại diện hoặc nút "Đăng xuất" trên thanh điều hướng.<br>2. Quan sát trạng thái phiên. | Không có | - Token trong `sessionStorage` bị xóa.<br>- Trình duyệt điều hướng về trang Đăng nhập `/login`.<br>- Bấm nút Back trên trình duyệt không xem lại được dữ liệu cũ. | Khớp 100%: Phiên đăng nhập kết thúc; URL chuyển về `/login`; token bị hủy. | High | Pass |
| **[Auth-8]** | Kiểm thử bảo mật (Risk-based Security): Chống SQL Injection trên form Login | Không phụ thuộc | 1. Nhập chuỗi tiêm SQL vào ô Email.<br>2. Nhập mật khẩu bất kỳ.<br>3. Nhấp nút "Đăng nhập". | Email: `' OR '1'='1' --`<br>Pass: `AnyPass@123` | Form xử lý an toàn; trả về lỗi 401 hoặc browser chặn; không bị bypass đăng nhập và không crash 500. | Khớp 100%: Hệ thống trả về 401 Unauthorized an toàn, không có lỗi sập CSDL. | High | Pass |

---

## MODULE 3 (US-03): PHÂN QUYỀN TRUY CẬP & ROUTE GUARD (RBAC PROTECTION)
- **Đường dẫn màn hình:** `/dashboard`, `/provider/*`, `/admin/*`
- **Mã nguồn liên quan:** `frontend/src/App.tsx`, `frontend/src/pages/auth/Forbidden403Page.tsx`, `frontend/src/pages/auth/Unauthorized401Page.tsx`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[RBAC-1]** | Khách chưa đăng nhập truy cập trang Dashboard của Consumer | Chưa đăng nhập (Guest) | 1. Mở tab ẩn danh mới.<br>2. Gõ trực tiếp URL `http://localhost:5173/dashboard`.<br>3. Nhấn Enter. | Chưa có token | Route Guard chặn truy cập; tự động điều hướng người dùng về trang Đăng nhập `/login` hoặc `/401`. | Khớp 100%: Trình duyệt lập tức bị điều hướng về URL `http://localhost:5173/login`. | High | Pass |
| **[RBAC-2]** | Khách chưa đăng nhập truy cập trang Quản trị Admin | Chưa đăng nhập (Guest) | 1. Mở tab ẩn danh mới.<br>2. Gõ trực tiếp URL `http://localhost:5173/admin`.<br>3. Nhấn Enter. | Chưa có token | Route Guard phát hiện thiếu JWT; điều hướng về trang `/login` hoặc `/401`. Không để lộ giao diện Admin. | Khớp 100%: Người dùng bị chặn truy cập và chuyển về trang đăng nhập. | High | Pass |
| **[RBAC-3]** | Consumer cố tình truy cập vào trang Quản trị Admin (Vượt quyền) | Đã đăng nhập vai trò Consumer (`user@example.com`) | 1. Đăng nhập tài khoản Consumer.<br>2. Gõ trực tiếp URL `http://localhost:5173/admin` trên thanh địa chỉ.<br>3. Nhấn Enter. | Token Role: `USER` | Route Guard chặn tức thì vì sai Role; điều hướng sang trang thông báo lỗi `http://localhost:5173/403` (Forbidden). | Khớp 100%: Trình duyệt hiển thị trang `/403` "Không có quyền truy cập"; không lộ dữ liệu quản trị. | High | Pass |
| **[RBAC-4]** | Consumer cố tình truy cập vào trang Quản lý của Provider | Đã đăng nhập vai trò Consumer (`user@example.com`) | 1. Đăng nhập tài khoản Consumer.<br>2. Gõ trực tiếp URL `http://localhost:5173/provider/dashboard`.<br>3. Nhấn Enter. | Token Role: `USER` | Route Guard chặn và điều hướng người dùng sang trang `http://localhost:5173/403`. | Khớp 100%: Chặn thành công và chuyển sang trang lỗi 403 Forbidden. | High | Pass |
| **[RBAC-5]** | Tài khoản Admin đăng nhập truy cập đúng không gian quản trị | Tài khoản `admin@example.com` / `Admin@123` | 1. Đăng nhập bằng tài khoản Admin.<br>2. Quan sát trang đích và thanh Sidebar. | Email: `admin@example.com`<br>Pass: `Admin@123` | - Điều hướng chính xác vào `http://localhost:5173/admin`.<br>- Sidebar hiển thị đủ 4 module: Người dùng, Xét duyệt API, Duyệt Provider, Audit Logs. | Khớp 100%: Điều hướng đúng `/admin`; menu quản trị hiển thị đầy đủ và không bị lỗi. | High | Pass |
| **[RBAC-6]** | Kiểm tra hiển thị Menu Sidebar theo đúng vai trò (Dynamic Role Menu) | Đăng nhập tài khoản Consumer | 1. Đăng nhập Consumer.<br>2. Quan sát các mục trên Sidebar bên trái màn hình. | Token Role: `USER` | Sidebar chỉ hiện: "Khám phá API", "Kho lưu trữ API Key", "Gói đăng ký", "Lịch sử yêu cầu". Ẩn hoàn toàn các mục của Admin và Provider. | Khớp 100%: Giao diện ẩn hoàn toàn các mục menu không thuộc quyền của Consumer. | Medium | Pass |

---

## MODULE 4 (US-04): QUẢN TRỊ VIÊN QUẢN LÝ NGƯỜI DÙNG (ADMIN USER MANAGEMENT)
- **Đường dẫn màn hình:** `http://localhost:5173/admin/users`
- **Mã nguồn liên quan:** `frontend/src/pages/admin/UserManagementPage.tsx`, `backend/src/admin.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[User-1]** | Kiểm tra hiển thị danh sách người dùng và các cột dữ liệu | Đã đăng nhập vai trò Admin (`admin@example.com`) | 1. Vào URL `http://localhost:5173/admin/users`.<br>2. Quan sát bảng dữ liệu người dùng. | Không có | Bảng nạp danh sách người dùng với đầy đủ các cột: ID, Tên hiển thị, Email, Vai trò (Badge), Trạng thái (Hoạt động/Đã khóa), Hành động. | Khớp 100%: Bảng nạp dữ liệu hoàn chỉnh, có phân trang và huy hiệu trạng thái rõ ràng. | Medium | Pass |
| **[User-2]** | Kiểm tra tính năng tìm kiếm người dùng theo Email | Có người dùng `user@example.com` trong hệ thống | 1. Nhập `user@example.com` vào ô tìm kiếm.<br>2. Nhấn Enter hoặc nút Tìm kiếm. | Từ khóa: `user@example.com` | Bảng cập nhật tức thì, chỉ hiển thị đúng bản ghi của người dùng có email trùng khớp. | Khớp 100%: Danh sách lọc chính xác người dùng theo email nhập vào. | High | Pass |
| **[User-3]** | Kiểm tra tính năng Khóa tài khoản người dùng (Lock User) | Tài khoản `test_lock@example.com` đang hoạt động (`is_active = true`) | 1. Tìm tài khoản `test_lock@example.com`.<br>2. Nhấp vào nút "Khóa tài khoản" (biểu tượng khóa).<br>3. Xác nhận trên popup cảnh báo. | Không có | - Huy hiệu trạng thái đổi sang màu đỏ: "Đã khóa".<br>- Nút chuyển thành "Mở khóa".<br>- Thông báo thành công: "Đã khóa tài khoản người dùng thành công." | Khớp 100%: Trạng thái chuyển thành "Đã khóa"; gửi request PATCH active: false thành công. | High | Pass |
| **[User-4]** | Kiểm tra tài khoản bị khóa không thể đăng nhập vào hệ thống | Tài khoản `test_lock@example.com` đã bị khóa ở test case [User-3] | 1. Mở trang `/login`.<br>2. Nhập email `test_lock@example.com` và đúng mật khẩu.<br>3. Nhấp nút "Đăng nhập". | Email: `test_lock@example.com`<br>Pass: `ValidPass@123` | Đăng nhập bị từ chối với HTTP 401; hiển thị thông báo lỗi: "Email hoặc mật khẩu không chính xác, hoặc phiên đăng nhập đã hết hạn." | Khớp 100%: Đăng nhập bị chặn hoàn toàn, không thể lấy JWT token. | High | Pass |
| **[User-5]** | Kiểm tra tính năng Mở khóa tài khoản người dùng (Unlock User) | Tài khoản `test_lock@example.com` đang bị khóa | 1. Tại trang `/admin/users`, nhấp nút "Mở khóa" tại tài khoản đó.<br>2. Xác nhận thao tác. | Không có | Huy hiệu trạng thái chuyển lại màu xanh "Hoạt động". Người dùng có thể đăng nhập lại bình thường. | Khớp 100%: Tài khoản được mở khóa thành công, đăng nhập lại bình thường. | High | Pass |
| **[User-6]** | Kiểm tra phân quyền: Consumer cố tình gọi API khóa người dùng | Token của tài khoản Consumer | 1. Gửi request PATCH tới `/api/admin/users/:id/status` với token của Consumer. | Token role USER | Server từ chối với mã lỗi HTTP 403 Forbidden; dữ liệu người dùng không bị thay đổi. | Khớp 100%: Hệ thống chặn với 403 Forbidden, bảo vệ an toàn API quản trị. | High | Pass |

---

# PHẦN 2: SPRINT 2 — QUY TRÌNH NHÀ CUNG CẤP & XÉT DUYỆT XUẤT BẢN API

## MODULE 5 (US-06): HỒ SƠ XÁC MINH NHÀ CUNG CẤP (PROVIDER KYC & COMPLIANCE)
- **Đường dẫn màn hình:** `http://localhost:5173/provider/verification`
- **Mã nguồn liên quan:** `frontend/src/pages/provider/ProviderVerificationPage.tsx`, `backend/src/provider-contract.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[KYC-1]** | Kiểm tra hiển thị form nộp hồ sơ KYC và trạng thái ban đầu | Tài khoản Provider chưa nộp hồ sơ | 1. Đăng nhập tài khoản Provider.<br>2. Vào trang `/provider/verification`.<br>3. Quan sát các thành phần trên form. | Không có | - Tiêu đề: "Tuân thủ & Xác minh Danh tính Nhà cung cấp API".<br>- Trạng thái: "Chưa xác minh".<br>- Đủ 3 trường có sao đỏ: Tên tổ chức, Email, URL minh chứng.<br>- Nút submit: "Nộp hồ sơ xác minh". | Khớp 100%: Tiêu đề đúng; banner trạng thái: "Chưa xác minh"; nút submit hiển thị rõ ràng. | Medium | Pass |
| **[KYC-2]** | Bỏ trống Tên tổ chức khi nộp hồ sơ (Force Errors) | Checkbox thỏa thuận đã được tích | 1. Để trống ô Tên tổ chức.<br>2. Nhập Email và URL hợp lệ.<br>3. Tích thỏa thuận và nhấp "Nộp hồ sơ xác minh". | Tên tổ chức: `""`<br>Email: `legal@techcorp.vn`<br>URL: `https://cdn.vn/gpdkkd.pdf` | Form bị chặn submit; ô Tên tổ chức tự động focus và hiện tooltip: "Please fill out this field." | Khớp 100%: Form không gửi request mạng; tooltip HTML5 kích hoạt đúng trường rỗng. | High | Pass |
| **[KYC-3]** | Bỏ trống Email liên hệ pháp lý khi nộp hồ sơ (Force Errors) | Checkbox thỏa thuận đã được tích | 1. Nhập Tên tổ chức hợp lệ.<br>2. Để trống ô Email.<br>3. Nhập URL hợp lệ và nhấp "Nộp hồ sơ xác minh". | Tên: `Công ty TNHH Giải Pháp Số`<br>Email: `""`<br>URL: `https://cdn.vn/gpdkkd.pdf` | Trình duyệt chặn submit; ô Email tự động focus và hiện tooltip HTML5: "Please fill out this field." | Khớp 100%: Trình duyệt chặn gửi form, focus trường Email. | High | Pass |
| **[KYC-4]** | Bỏ trống ô Liên kết tài liệu minh chứng (Force Errors) | Checkbox thỏa thuận đã được tích | 1. Nhập Tên và Email hợp lệ.<br>2. Để trống ô URL minh chứng đầu tiên.<br>3. Nhấp "Nộp hồ sơ xác minh". | Tên: `Công ty ABC`<br>Email: `legal@abc.vn`<br>URL: `""` | Trình duyệt chặn submit; ô URL kích hoạt HTML5 required validation. | Khớp 100%: Form bị chặn gửi; tooltip HTML5 kích hoạt trên trường URL. | High | Pass |
| **[KYC-5]** | Quên tích chọn Checkbox cam kết thỏa thuận nhà cung cấp | Đang ở form KYC | 1. Nhập đầy đủ Tên, Email, URL hợp lệ.<br>2. Không tích vào ô thỏa thuận.<br>3. Quan sát nút submit. | Dữ liệu hợp lệ, Checkbox: `Unchecked` | Nút "Nộp hồ sơ xác minh" duy trì trạng thái vô hiệu hóa (`disabled = true`), không thể bấm. | Khớp 100%: Nút submit bị disabled; khi tích chọn thì nút chuyển enabled tức thì. | High | Pass |
| **[KYC-6]** | Phân vùng không hợp lệ: Nhập URL minh chứng dùng giao thức FTP | Checkbox thỏa thuận đã được tích | 1. Nhập Tên và Email hợp lệ.<br>2. Nhập `ftp://myfiles.org/giayphep.pdf` vào ô URL.<br>3. Nhấp "Nộp hồ sơ xác minh". | URL: `ftp://myfiles.org/giayphep.pdf` | Form chặn submit và hiển thị alert đỏ: "Liên kết ftp://myfiles.org/giayphep.pdf không hợp lệ. Phải bắt đầu bằng http:// hoặc https://" | Khớp 100%: Hiển thị alert đỏ chặn giao thức FTP không an toàn đúng như mô tả. | High | Pass |
| **[KYC-7]** | Phân tích giá trị biên: Tên tổ chức chỉ toàn khoảng trắng | Checkbox thỏa thuận đã được tích | 1. Nhập chuỗi 5 khoảng trắng vào ô Tên tổ chức.<br>2. Nhập Email và URL hợp lệ.<br>3. Nhấp "Nộp hồ sơ xác minh". | Tên tổ chức: `     `<br>Email: `contact@alpha.vn`<br>URL: `https://alpha.vn/doc.pdf` | Vượt qua HTML5 required nhưng bị chặn bởi logic frontend; xuất hiện alert đỏ: "Vui lòng nhập tên công ty / tổ chức." | Khớp 100%: Logic Javascript `.trim()` phát hiện chuỗi rỗng và hiển thị cảnh báo đỏ. | Medium | Pass |
| **[KYC-8]** | Luồng thành công (Happy Path): Nộp hồ sơ KYC và khóa Form | Tài khoản Provider chưa nộp KYC | 1. Nhập Tên tổ chức hợp lệ.<br>2. Nhập Email hợp lệ.<br>3. Nhập 2 URL minh chứng.<br>4. Tích thỏa thuận và nhấp "Nộp hồ sơ xác minh". | Tên: `Tập đoàn Công nghệ Alpha`<br>Email: `legal@alpha.vn`<br>URLs: 2 link https<br>Agreement: `Checked` | - Thông báo thành công màu xanh.<br>- Banner trạng thái đổi sang màu vàng: "Đang chờ duyệt (Pending)".<br>- Toàn bộ form tự động chuyển sang chế độ Khóa (`disabled: true`). | Khớp 100%: Thông báo xanh xuất hiện; trạng thái chuyển "Pending"; toàn bộ form bị khóa. | High | Pass |

---

## MODULE 6 (US-07): ADMIN PHÊ DUYỆT & TỪ CHỐI KYC (PROVIDER KYC REVIEW)
- **Đường dẫn màn hình:** `http://localhost:5173/admin/provider-verifications`
- **Mã nguồn liên quan:** `frontend/src/pages/admin/ProviderVerificationsPage.tsx`, `backend/src/admin-review-contract.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[RevKYC-1]**| Xem danh sách hồ sơ KYC đang chờ duyệt | Đã đăng nhập Admin (`admin@example.com`) | 1. Vào trang `/admin/provider-verifications`.<br>2. Chọn tab hoặc filter "Chờ duyệt (Pending)". | Filter: `status=Pending` | Hiển thị danh sách các hồ sơ đang chờ xét duyệt kèm tên tổ chức, email, thời gian nộp và link minh chứng. | Khớp 100%: Bảng nạp danh sách hồ sơ Pending sắp xếp theo thời gian nộp mới nhất. | Medium | Pass |
| **[RevKYC-2]**| Kiểm tra mở xem tài liệu minh chứng trong tab mới | Có hồ sơ Pending trong danh sách | 1. Nhấp chuột vào link tài liệu minh chứng của hồ sơ. | Không có | Trình duyệt mở liên kết trong tab mới an toàn với thuộc tính `target="_blank"` và `rel="noopener noreferrer"`. | Khớp 100%: Tab mới mở link tài liệu minh chứng an toàn. | Low | Pass |
| **[RevKYC-3]**| Admin từ chối hồ sơ nhưng bỏ trống lý do từ chối (Force Errors) | Có hồ sơ Pending | 1. Nhấp nút "Từ chối" tại hồ sơ.<br>2. Modal hiện lên, để trống ô Lý do từ chối.<br>3. Nhấp "Xác nhận từ chối". | Lý do: `""` | Hệ thống chặn submit; hiển thị cảnh báo: "Vui lòng nhập lý do từ chối hồ sơ." Hồ sơ không bị đổi trạng thái. | Khớp 100%: Cảnh báo bắt buộc nhập lý do hiển thị; trạng thái hồ sơ giữ nguyên Pending. | High | Pass |
| **[RevKYC-4]**| Luồng Admin từ chối hồ sơ hợp lệ kèm lý do | Có hồ sơ Pending | 1. Nhấp nút "Từ chối".<br>2. Nhập lý do: "Giấy phép kinh doanh đã hết hạn".<br>3. Nhấp "Xác nhận từ chối". | Lý do: `Giấy phép kinh doanh đã hết hạn` | - Trạng thái hồ sơ chuyển sang màu đỏ: "Bị từ chối (Rejected)".<br>- Ghi nhận lý do từ chối.<br>- Ghi 1 bản ghi vào Audit Log. | Khớp 100%: Trạng thái chuyển Rejected; lý do được lưu vào CSDL; hiển thị thông báo thành công. | High | Pass |
| **[RevKYC-5]**| Luồng Admin phê duyệt hồ sơ KYC thành công | Có hồ sơ Provider đang Pending | 1. Nhấp nút "Phê duyệt" tại hồ sơ.<br>2. Xác nhận phê duyệt trên modal. | Quyết định: `Verified` | - Trạng thái hồ sơ đổi sang màu xanh: "Đã duyệt (Verified)".<br>- Tài khoản Provider tương ứng được cấp quyền tạo và đăng bán API.<br>- Ghi audit log `provider.verified`. | Khớp 100%: Hồ sơ chuyển Verified; quyền tạo API của Provider được mở khóa tức thì. | High | Pass |
| **[RevKYC-6]**| Chặn thao tác duyệt lại trên hồ sơ đã xử lý (Conflict Check) | Hồ sơ đã ở trạng thái Verified | 1. Cố tình gửi lại request review trên hồ sơ đã duyệt. | Review lại hồ sơ cũ | Hệ thống trả về HTTP 409 Conflict với mã lỗi: `VERIFICATION_ALREADY_REVIEWED`. | Khớp 100%: Server từ chối xử lý hồ sơ đã duyệt, ngăn chặn ghi đè trạng thái. | Medium | Pass |

---

## MODULE 7 (US-08): KHAI BÁO PHÁP LÝ & XÁC MINH TÊN MIỀN (LEGAL & DOMAIN VERIFICATION)
- **Đường dẫn màn hình:** `http://localhost:5173/provider/apis/:id/legal`
- **Mã nguồn liên quan:** `frontend/src/pages/provider/PublishingWorkflowPage.tsx`, `backend/src/provider-domain.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Legal-1]** | Xem nội dung Thỏa thuận Nhà cung cấp có hiệu lực | Đăng nhập tài khoản Provider | 1. Vào trang khai báo pháp lý của API.<br>2. Quan sát khung hiển thị Thỏa thuận nhà cung cấp. | Không có | Hệ thống hiển thị đúng phiên bản thỏa thuận đang hoạt động (`is_active = true`), ngày hiệu lực và nội dung điều khoản. | Khớp 100%: Nội dung thỏa thuận được nạp đầy đủ từ API `/api/provider/agreement`. | Medium | Pass |
| **[Legal-2]** | Khai báo xử lý dữ liệu cá nhân (GDPR/PDPA) hợp lệ | Có API ở trạng thái Draft | 1. Tích chọn "API có xử lý dữ liệu cá nhân".<br>2. Chọn các loại dữ liệu: "Email, Số điện thoại".<br>3. Nhập mục đích xử lý: "Xác thực người dùng".<br>4. Nhấp nút "Lưu khai báo". | Dữ liệu cá nhân: Có<br>Loại: Email, SĐT<br>Mục đích: Xác thực | Hệ thống lưu trữ thành công; hiển thị thông báo xanh: "Đã cập nhật khai báo pháp lý thành công." | Khớp 100%: Dữ liệu pháp lý được lưu trữ vào bảng `api_legal_declarations`. | High | Pass |
| **[Legal-3]** | Tích chọn có dữ liệu cá nhân nhưng bỏ trống mục đích xử lý | Có API ở trạng thái Draft | 1. Tích chọn "Có xử lý dữ liệu cá nhân".<br>2. Để trống ô Mục đích xử lý.<br>3. Nhấp nút "Lưu khai báo". | Mục đích: `""` | Hệ thống chặn lưu; hiển thị lỗi: "Vui lòng nêu rõ mục đích xử lý dữ liệu cá nhân của người dùng." | Khớp 100%: Form bị chặn submit; alert đỏ yêu cầu bổ sung mục đích xử lý. | High | Pass |
| **[Legal-4]** | Tạo mã DNS TXT Challenge để xác minh quyền sở hữu tên miền | API có hostname riêng | 1. Tại mục Xác minh Tên miền, nhập hostname: `api.mycompany.vn`.<br>2. Nhấp nút "Tạo mã xác thực". | Hostname: `api.mycompany.vn` | Hệ thống sinh chuỗi token ngẫu nhiên (VD: `apihub-verify=a1b2c3d4...`) và hiển thị hướng dẫn cấu hình DNS TXT. | Khớp 100%: Token challenge được sinh và lưu vào `api_domain_verifications`. | High | Pass |
| **[Legal-5]** | Nhấn "Xác minh ngay" khi chưa cấu hình bản ghi DNS TXT | Bản ghi DNS chưa tồn tại trên Internet | 1. Nhấp nút "Xác minh ngay".<br>2. Quan sát phản hồi kiểm tra DNS. | Hostname chưa trỏ TXT | Hệ thống kiểm tra DNS thực tế, phát hiện chưa có bản ghi và báo lỗi: "Không tìm thấy bản ghi DNS TXT khớp với mã xác thực. Vui lòng thử lại sau." | Khớp 100%: DNS lookup trả về thất bại; hiển thị cảnh báo đỏ yêu cầu kiểm tra lại bản ghi. | High | Pass |
| **[Legal-6]** | Xác minh thành công tên miền khi bản ghi DNS TXT đã trỏ đúng | Đã cấu hình TXT record trên DNS server | 1. Nhấp nút "Xác minh ngay" sau khi cấu hình DNS.<br>2. Quan sát trạng thái tên miền. | DNS TXT đã khớp | Trạng thái tên miền chuyển sang màu xanh: "Đã xác minh (Verified)". Hostname được gắn cờ tin cậy. | Khớp 100%: Hệ thống xác nhận bản ghi khớp; hostname đổi sang trạng thái Verified. | High | Pass |

---

## MODULE 8 (US-09 & US-10): QUẢN LÝ API, ENDPOINT & IMPORT OPENAPI DOCS
- **Đường dẫn màn hình:** `/provider/apis/create`, `/provider/apis/:id/docs`
- **Mã nguồn liên quan:** `frontend/src/pages/provider/CreateApiWizardPage.tsx`, `frontend/src/pages/provider/OpenApiImportPage.tsx`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[ApiDoc-1]**| Khởi tạo API mới qua Wizard: Bỏ trống các trường bắt buộc | Đã đăng nhập Provider đã Verified | 1. Vào `/provider/apis/create`.<br>2. Để trống Tên API và Upstream URL.<br>3. Nhấp "Tiếp tục". | Tên: `""`<br>URL: `""` | Trình duyệt kích hoạt HTML5 validation, chặn chuyển bước tiếp theo. | Khớp 100%: Không thể chuyển bước; các ô bắt buộc được đánh dấu đỏ. | High | Pass |
| **[ApiDoc-2]**| Kiểm tra phân vùng: Nhập Upstream Base URL sai định dạng | Đang ở bước tạo API | 1. Nhập tên API hợp lệ.<br>2. Nhập ô Upstream URL: `not-a-valid-url`.<br>3. Nhấp "Tiếp tục". | URL: `not-a-valid-url` | Hệ thống báo lỗi: "Upstream URL phải bắt đầu bằng http:// hoặc https://". | Khớp 100%: Cảnh báo định dạng URL kích hoạt; ngăn submit URL dị dạng. | High | Pass |
| **[ApiDoc-3]**| Luồng tạo API thành công ở trạng thái Draft | Dữ liệu khởi tạo hợp lệ | 1. Nhập Tên: "Weather Forecast API".<br>2. Nhập Danh mục: "Thời tiết & Khí hậu".<br>3. Nhập Base URL: `https://api.weather.vn`.<br>4. Nhấp "Tạo API". | Tên: `Weather Forecast API`<br>URL: `https://api.weather.vn` | API được tạo thành công ở trạng thái "Bản nháp (Draft)"; tự động điều hướng sang trang chi tiết quản lý API. | Khớp 100%: Tạo API thành công với status Draft; URL chuyển về trang quản lý API vừa tạo. | High | Pass |
| **[ApiDoc-4]**| Thêm thủ công một Endpoint mới cho API | Đang ở trang quản lý endpoint | 1. Nhấp nút "+ Thêm Endpoint".<br>2. Chọn Method: `GET`.<br>3. Nhập Path: `/v1/current`.<br>4. Nhập mô tả và nhấp "Lưu". | Method: `GET`<br>Path: `/v1/current` | Endpoint mới được ghi nhận và hiển thị trên bảng danh sách endpoint của API. | Khớp 100%: Endpoint `GET /v1/current` được lưu vào DB và hiển thị trên giao diện. | High | Pass |
| **[ApiDoc-5]**| Thêm Endpoint với Path thiếu dấu gạch chéo `/` đầu dòng | Đang ở modal thêm endpoint | 1. Nhập Path: `v1/current` (không có `/`).<br>2. Nhấp "Lưu". | Path: `v1/current` | Hệ thống tự động chuẩn hóa thêm `/` thành `/v1/current` hoặc báo lỗi yêu cầu bắt đầu bằng `/`. | Khớp 100%: Path được chuẩn hóa chính xác thành `/v1/current`. | Medium | Pass |
| **[ApiDoc-6]**| Import tài liệu OpenAPI JSON sai cú pháp (Malformed JSON) | Đang ở trang `/provider/apis/:id/docs` | 1. Dán một chuỗi JSON lỗi cú pháp (thiếu ngoặc nhọn).<br>2. Nhấp nút "Import Tài liệu". | JSON: `{"openapi": "3.0.0", "info": {` | Hệ thống bắt lỗi cú pháp parser; hiển thị alert đỏ: "Tệp tài liệu không đúng định dạng JSON hợp lệ." | Khớp 100%: Trình duyệt bắt lỗi JSON.parse; hiển thị thông báo lỗi rõ ràng. | High | Pass |
| **[ApiDoc-7]**| Luồng Import thành công tài liệu OpenAPI 3.0 chuẩn | Chuỗi OpenAPI 3.0 JSON hợp lệ | 1. Dán nội dung OpenAPI JSON hợp lệ.<br>2. Nhấp "Import Tài liệu". | OpenAPI 3.0 spec chuẩn | - Hệ thống phân tích spec thành công.<br>- Tự động trích xuất danh sách endpoint.<br>- Giao diện nạp đầy đủ 7 khối tài liệu kỹ thuật chuẩn hóa. | Khớp 100%: Import thành công; tài liệu được lưu và hiển thị trực quan dạng Swagger/Docs. | High | Pass |
| **[ApiDoc-8]**| Kiểm tra tính năng đồng bộ và cập nhật lại phiên bản tài liệu | Đã có tài liệu phiên bản cũ | 1. Sửa đổi mô tả endpoint trong tài liệu.<br>2. Nhấp "Cập nhật tài liệu". | Version: `v1.1` | Tài liệu được cập nhật phiên bản mới; lưu lại lịch sử chỉnh sửa tài liệu. | Khớp 100%: Tài liệu cập nhật thành công; hiển thị badge phiên bản mới nhất. | Medium | Pass |

---

## MODULE 9 (US-11): CẤU HÌNH GÓI CƯỚC DỊCH VỤ (API PRICING PLANS)
- **Đường dẫn màn hình:** `http://localhost:5173/provider/apis/:id/plans`
- **Mã nguồn liên quan:** `frontend/src/pages/provider/PricingManagementPage.tsx`, `backend/src/provider-plans.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Plan-1]** | Khởi tạo Gói cước Miễn phí (Free Plan - 0 VNĐ) | Có API ở trạng thái Draft | 1. Vào trang cấu hình gói cước.<br>2. Nhấp "+ Tạo Gói Giá".<br>3. Nhập Tên: "Gói Khởi Đầu".<br>4. Nhập Giá: `0`.<br>5. Nhập Hạn ngạch: `1000` req/tháng.<br>6. Nhấp "Lưu gói". | Tên: `Gói Khởi Đầu`<br>Giá: `0`<br>Quota: `1000` | Gói giá được tạo thành công với Badge "Miễn phí" và trạng thái "Đang hoạt động". | Khớp 100%: Gói cước Free được lưu thành công vào CSDL với `price_monthly = 0`. | High | Pass |
| **[Plan-2]** | Khởi tạo Gói cước Trả phí (Paid Plan - Có phí định kỳ) | Đang ở trang cấu hình gói giá | 1. Nhấp "+ Tạo Gói Giá".<br>2. Nhập Tên: "Gói Doanh Nghiệp".<br>3. Nhập Giá: `500000`.<br>4. Nhập Hạn ngạch: `100000`.<br>5. Nhập Rate Limit: `60` req/phút.<br>6. Nhấp "Lưu gói". | Tên: `Gói Doanh Nghiệp`<br>Giá: `500000`<br>Rate: `60` | Gói giá được tạo thành công với hiển thị giá `500.000 ₫/tháng` và giới hạn tốc độ 60 req/phút. | Khớp 100%: Gói trả phí hiển thị định dạng tiền tệ chuẩn xác và trạng thái hoạt động. | High | Pass |
| **[Plan-3]** | Phân tích giá trị biên: Nhập giá tiền là số âm (Negative Price) | Đang ở modal tạo gói giá | 1. Nhập Giá gói: `-50000`.<br>2. Nhấp nút "Lưu gói". | Giá: `-50000` | Hệ thống chặn submit; hiển thị lỗi: "Giá gói cước không được là số âm." | Khớp 100%: Ràng buộc validation số dương kích hoạt; ngăn chặn tạo gói cước số âm. | High | Pass |
| **[Plan-4]** | Phân tích giá trị biên: Bỏ trống Tên gói giá (Force Errors) | Đang ở modal tạo gói giá | 1. Để trống ô Tên gói.<br>2. Nhập giá và hạn ngạch hợp lệ.<br>3. Nhấp "Lưu gói". | Tên gói: `""` | Trình duyệt kích hoạt HTML5 required, chặn gửi form. | Khớp 100%: Ô Tên gói tự động focus và hiện thông báo bắt buộc điền. | High | Pass |
| **[Plan-5]** | Tính năng Ngừng áp dụng gói giá (Deactivate Plan) | Đã có gói giá đang Active | 1. Nhấp nút "Ngừng áp dụng" tại một gói giá.<br>2. Xác nhận thao tác trên modal. | Không có | Trạng thái gói giá đổi sang "Đã ngưng hoạt động" (`is_active = false`). Gói này sẽ bị ẩn trên sàn Marketplace công khai. | Khớp 100%: Gói giá chuyển `is_active = false`; không còn xuất hiện trên trang mua API. | High | Pass |
| **[Plan-6]** | Tính năng Kích hoạt lại gói giá đã ngưng (Re-activate Plan) | Đang có gói giá ngưng hoạt động | 1. Nhấp nút "Kích hoạt lại" tại gói đã ngưng.<br>2. Xác nhận thao tác. | Không có | Trạng thái gói giá chuyển lại thành "Hoạt động". | Khớp 100%: Gói cước được mở lại trạng thái hoạt động thành công. | Medium | Pass |

---

## MODULE 10 (US-12 & US-13): NỘP DUYỆT & XUẤT BẢN API (READINESS & PUBLISHING)
- **Đường dẫn màn hình:** `/provider/apis/:id/submit`, `/admin/api-reviews`
- **Mã nguồn liên quan:** `frontend/src/pages/provider/PublishingWorkflowPage.tsx`, `frontend/src/pages/admin/ApiReviewsPage.tsx`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Pub-1]** | Kiểm tra Bảng kiểm độ sẵn sàng (Readiness Checklist) khi thiếu Docs và Plan | API mới tạo, chưa có tài liệu và gói giá | 1. Vào trang Nộp duyệt API `/provider/apis/:id/submit`.<br>2. Quan sát bảng Checklist các tiêu chí. | Không có | - Mục "Tài liệu kỹ thuật": Dấu X đỏ (Chưa hoàn thành).<br>- Mục "Gói giá dịch vụ": Dấu X đỏ (Chưa hoàn thành).<br>- Nút "Nộp hồ sơ xét duyệt" bị vô hiệu hóa (`disabled: true`). | Khớp 100%: Nút nộp bị vô hiệu hóa khi các điều kiện checklist chưa thỏa mãn. | High | Pass |
| **[Pub-2]** | Kiểm tra Checklist khi đã điền đầy đủ mọi điều kiện bắt buộc | API đã cấu hình Docs, Endpoints và Plans | 1. Vào lại trang Nộp duyệt API.<br>2. Quan sát lại bảng Checklist. | Đã đủ dữ liệu | - Toàn bộ các tiêu chí hiển thị tích xanh ✓.<br>- Nút "Nộp hồ sơ xét duyệt" chuyển sang trạng thái khả dụng (`disabled: false`). | Khớp 100%: Nút submit sáng lên và cho phép click nộp hồ sơ. | High | Pass |
| **[Pub-3]** | Luồng Nộp duyệt API thành công (Submit for Review) | Checklist đạt 100% | 1. Nhấp nút "Nộp hồ sơ xét duyệt".<br>2. Nhập ghi chú cho Admin: "Nhờ Admin duyệt gấp".<br>3. Xác nhận nộp. | Ghi chú: `Nhờ Admin duyệt gấp` | - Trạng thái API chuyển từ `Draft` sang `Under Review` (Đang thẩm định).<br>- Toàn bộ cấu hình API bị khóa không cho sửa đổi trong khi chờ duyệt. | Khớp 100%: Trạng thái chuyển `Under Review`; form chuyển sang chế độ chỉ đọc. | High | Pass |
| **[Pub-4]** | Admin xem danh sách API chờ duyệt trên trang Quản trị | Đã đăng nhập Admin | 1. Vào URL `http://localhost:5173/admin/api-reviews`.<br>2. Quan sát danh sách API cần thẩm định. | Filter: `Under Review` | Hiển thị đầy đủ API vừa nộp kèm tên Provider, số lượng endpoint, các gói giá và ghi chú. | Khớp 100%: Bảng nạp danh sách API cần duyệt hoàn chỉnh, có nút Xem chi tiết. | Medium | Pass |
| **[Pub-5]** | Admin từ chối phê duyệt API nhưng không nhập lý do (Force Errors) | Đang mở modal xét duyệt API | 1. Nhấp nút "Từ chối".<br>2. Để trống ô Lý do từ chối.<br>3. Nhấp "Xác nhận". | Lý do: `""` | Hệ thống chặn submit; alert đỏ: "Vui lòng nhập lý do từ chối phê duyệt API." Trạng thái giữ nguyên. | Khớp 100%: Modal bắt buộc nhập lý do từ chối; ngăn gửi request rỗng. | High | Pass |
| **[Pub-6]** | Admin từ chối phê duyệt API kèm lý do chi tiết | Có API Under Review | 1. Nhấp "Từ chối".<br>2. Nhập lý do: "Tài liệu OpenAPI thiếu mô tả response 400 và 500".<br>3. Nhấp "Xác nhận". | Lý do: `Tài liệu OpenAPI thiếu mô tả response...` | - Trạng thái API chuyển về `Rejected` (hoặc `Draft`).<br>- Lưu lý do từ chối để Provider chỉnh sửa.<br>- Ghi audit log. | Khớp 100%: API chuyển trạng thái; Provider thấy lý do từ chối trên dashboard của mình. | High | Pass |
| **[Pub-7]** | Luồng Admin phê duyệt và Xuất bản API thành công (Publish API) | Có API Under Review | 1. Nhấp nút "Phê duyệt & Xuất bản".<br>2. Xác nhận phê duyệt. | Quyết định: `Approved` | - Trạng thái API đổi sang màu xanh: "Đã xuất bản (Published)".<br>- Ghi nhận thời gian `published_at = NOW()`.<br>- API xuất hiện ngay lập tức trên sàn Marketplace công khai. | Khớp 100%: Trạng thái đổi thành Published; API chính thức xuất hiện trên Marketplace. | High | Pass |
| **[Pub-8]** | Kiểm tra API đã Xuất bản xuất hiện trên trang Marketplace công khai | Thực hiện ngay sau test case [Pub-7] | 1. Mở trang Marketplace `http://localhost:5173/marketplace`.<br>2. Tìm tên API vừa xuất bản. | Tên API vừa duyệt | API xuất hiện trên danh sách tìm kiếm công khai kèm thẻ giá, tags và thông tin nhà cung cấp. | Khớp 100%: API vừa xuất bản xuất hiện ngay lập tức trên giao diện Marketplace. | High | Pass |

---

## MODULE 11 (US-14): NHẬT KÝ KIỂM TOÁN QUẢN TRỊ (ADMIN AUDIT LOGS)
- **Đường dẫn màn hình:** `http://localhost:5173/admin/audit-logs`
- **Mã nguồn liên quan:** `frontend/src/pages/admin/AuditLogsPage.tsx`, `backend/src/audit-contract.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Audit-1]**| Xem danh sách sự kiện kiểm toán hệ thống | Đã đăng nhập vai trò Admin | 1. Vào trang `/admin/audit-logs`.<br>2. Quan sát bảng nhật ký kiểm toán. | Không có | Bảng hiển thị đầy đủ các cột: ID, Dấu thời gian, Tác nhân (Actor ID/Email), Hành động (Action), Tài nguyên mục tiêu, IP client, Chi tiết metadata. | Khớp 100%: Bảng nạp toàn bộ lịch sử thao tác hệ thống theo thứ tự thời gian mới nhất. | Medium | Pass |
| **[Audit-2]**| Lọc nhật ký kiểm toán theo Loại hành động (Action Filter) | Đã có các log trong hệ thống | 1. Chọn bộ lọc Action: `provider.verified`.<br>2. Nhấn Lọc. | Action: `provider.verified` | Bảng chỉ hiển thị các sự kiện liên quan đến việc phê duyệt Provider của Quản trị viên. | Khớp 100%: Danh sách lọc chuẩn xác các sự kiện khớp với mã hành động được chọn. | High | Pass |
| **[Audit-3]**| Lọc nhật ký kiểm toán theo Khoảng ngày (Date Range Filter) | Đã có log trong hệ thống | 1. Chọn Từ ngày: `10/10/2026`.<br>2. Chọn Đến ngày: `11/10/2026`.<br>3. Nhấn Lọc. | Khoảng ngày hợp lệ | Bảng chỉ hiển thị các bản ghi kiểm toán phát sinh trong khoảng thời gian đã chọn. | Khớp 100%: Phân đoạn thời gian lọc chính xác theo timestamp của sự kiện. | Medium | Pass |
| **[Audit-4]**| Kiểm tra tính bất biến của nhật ký (Log Immutability) | Đang xem trang Audit Logs | 1. Quan sát bảng và các thao tác trên giao diện. | Không có | Giao diện hoàn toàn không có nút Sửa (Edit) hoặc Xóa (Delete) bản ghi kiểm toán. | Khớp 100%: Bản ghi kiểm toán là Read-only tuyệt đối, không có chức năng sửa/xóa. | High | Pass |
| **[Audit-5]**| Kiểm tra bảo mật: Consumer không thể truy cập trang Audit Logs | Đăng nhập tài khoản Consumer | 1. Gõ URL `http://localhost:5173/admin/audit-logs`.<br>2. Nhấn Enter. | Token role USER | Route Guard chặn và chuyển sang trang lỗi `/403`. API trả về 403 Forbidden. | Khớp 100%: Người dùng thông thường bị chặn hoàn toàn, không thể xem nhật ký kiểm toán. | High | Pass |

---

# PHẦN 3: SPRINT 3 — SÀN THƯƠNG MẠI, TIÊU THỤ API & CỔNG GATEWAY

## MODULE 12 (US-16): KHÁM PHÁ, TÌM KIẾM & LỌC SÀN API (MARKETPLACE DISCOVERY)
- **Đường dẫn màn hình:** `http://localhost:5173/marketplace`
- **Mã nguồn liên quan:** `frontend/src/pages/marketplace/MarketplacePage.tsx`, `backend/src/marketplace-service.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Market-1]**| Truy cập công khai Sàn Marketplace không cần đăng nhập | Khách vãng lai (Guest) | 1. Mở tab ẩn danh mới.<br>2. Vào URL `http://localhost:5173/marketplace`.<br>3. Quan sát giao diện. | Không có | Trang tải bình thường; hiển thị danh sách các API đã xuất bản, bộ tìm kiếm, bộ lọc danh mục và giá cả. Không yêu cầu đăng nhập. | Khớp 100%: Trang khám phá API truy cập công khai 100%, không bị chuyển về trang đăng nhập. | Medium | Pass |
| **[Market-2]**| Tìm kiếm API theo từ khóa tên không phân biệt chữ hoa/thường | Có API tên "Product Catalog API" | 1. Nhập từ khóa `product` vào ô tìm kiếm.<br>2. Nhập từ khóa `PRODUCT` vào ô tìm kiếm.<br>3. So sánh kết quả hiển thị. | `q: "product"` và `q: "PRODUCT"` | Cả hai lần tìm kiếm đều trả về cùng kết quả hiển thị "Product Catalog API". | Khớp 100%: Tìm kiếm case-insensitive hoạt động chính xác trên cả tên và mô tả. | High | Pass |
| **[Market-3]**| Tìm kiếm với ký tự đặc biệt SQL wildcard (`%` và `_`) | Không phụ thuộc | 1. Nhập ký tự `%` vào ô tìm kiếm.<br>2. Nhấn Enter. | `q: "%"` | Hệ thống xử lý ký tự `%` như chuỗi ký tự thông thường, không quét wildcard toàn bộ database gây quá tải server. | Khớp 100%: Hệ thống xử lý an toàn, trả về kết quả rỗng hoặc API có chứa dấu `%`. | High | Pass |
| **[Market-4]**| Lọc kết hợp Danh mục và Thẻ Tag (Logic AND) | Có API thuộc Finance có tag payment | 1. Chọn Danh mục: "Finance".<br>2. Chọn Tag: "payment".<br>3. Quan sát kết quả lọc. | Category: `Finance`<br>Tag: `payment` | Chỉ hiển thị các API thỏa mãn đồng thời cả hai điều kiện: vừa thuộc Finance, vừa gắn tag payment. | Khớp 100%: Logic lọc AND hoạt động chuẩn xác, loại trừ các API chỉ thỏa mãn 1 trong 2. | High | Pass |
| **[Market-5]**| Lọc theo Gói cước Miễn phí (Pricing = Free) | Có API có gói 0đ và API chỉ có gói tính phí | 1. Chọn bộ lọc Giá: "Miễn phí (Free)". | Filter: `pricing=free` | Chỉ hiển thị các API có ít nhất một gói cước đang hoạt động với giá 0đ. | Khớp 100%: Danh sách chỉ chứa các API có gói Free, gắn badge "Gói Free khả dụng". | High | Pass |
| **[Market-6]**| Sắp xếp danh sách API theo Mới nhất (Sort = Newest) | Nhiều API đã xuất bản | 1. Chọn mục sắp xếp: "Mới nhất". | Sort: `newest` | Các API có thời gian xuất bản gần nhất (`published_at DESC, id DESC`) xuất hiện ở đầu trang. | Khớp 100%: Sắp xếp ổn định theo thời gian xuất bản giảm dần. | Medium | Pass |
| **[Market-7]**| Kiểm tra phân trang danh sách API (Pagination) | Tổng số API > 12 | 1. Cuộn xuống cuối trang.<br>2. Nhấp sang Trang 2.<br>3. Quan sát danh sách bản ghi. | Page: `2` | Danh sách hiển thị các phần tử của trang tiếp theo; số trang và tổng số bản ghi nhất quán. | Khớp 100%: Chuyển trang mượt mà; danh sách nạp đúng trang dữ liệu tiếp theo. | Medium | Pass |
| **[Market-8]**| Bảo mật: Tuyệt đối không hiển thị API Draft hoặc Suspended | Có API ở trạng thái Draft và Suspended trong DB | 1. Quan sát toàn bộ danh sách tìm kiếm và lọc trên Marketplace. | Không có | Tuyệt đối không xuất hiện bất kỳ API nào có trạng thái `Draft`, `Under Review` hoặc `Suspended` trên sàn. | Khớp 100%: 100% API xuất hiện trên Marketplace đều ở trạng thái Published. | High | Pass |

---

## MODULE 13 (US-17): CHI TIẾT API & TÀI LIỆU CÔNG KHAI (PUBLIC API DOCUMENTATION)
- **Đường dẫn màn hình:** `http://localhost:5173/marketplace/:id`
- **Mã nguồn liên quan:** `frontend/src/pages/marketplace/ApiDetailPage.tsx`, `backend/src/marketplace-service.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Detail-1]**| Xem chi tiết đầy đủ của một API đã xuất bản | API ID = 3 đang Published | 1. Nhấp vào thẻ API "Product Catalog API" trên Marketplace (URL `/marketplace/3`).<br>2. Quan sát các tab nội dung. | ID: `3` | Hiển thị đầy đủ thông tin: Tên, Mô tả, Nhà cung cấp (Tên, Badge Verified), Danh sách phiên bản, Các gói giá dịch vụ, Tuyên bố pháp lý & Dữ liệu cá nhân. | Khớp 100%: Trang nạp đầy đủ thông tin kỹ thuật và thương mại của API. | High | Pass |
| **[Detail-2]**| Xem tài liệu tương tác OpenAPI / Swagger Docs | Đang ở trang chi tiết API | 1. Chuyển sang tab "Tài liệu API" (Documentation).<br>2. Nhấp mở rộng một Endpoint cụ thể (VD: `GET /products`). | Không có | Giao diện hiển thị chi tiết: Method, URL Path, Bảng tham số (Parameters), Request Body Schema và Mẫu phản hồi (Response Example 200). | Khớp 100%: Tài liệu OpenAPI hiển thị cấu trúc endpoint rõ ràng, chuẩn định dạng Swagger. | Medium | Pass |
| **[Detail-3]**| Kiểm tra danh sách Gói cước hiển thị trên trang chi tiết | API có cả gói Free và gói Paid | 1. Chuyển sang tab "Gói cước & Bảng giá" (Pricing). | Không có | Hiển thị thẻ gói giá kèm đầy đủ thông tin: Tên gói, Giá tiền, Hạn ngạch gọi hàng tháng, Giới hạn tần suất và nút "Đăng ký gói". | Khớp 100%: Các gói giá đang hoạt động hiển thị đầy đủ thông số; gói ngưng áp dụng bị ẩn. | High | Pass |
| **[Detail-4]**| Kiểm tra bảo mật: Không rò rỉ dữ liệu nhạy cảm nội bộ | API có dữ liệu KYC và review nội bộ | 1. Mở DevTools tab Network $\to$ kiểm tra response JSON của `GET /api/marketplace/apis/3`. | Không có | Payload tuyệt đối không chứa: link chứng từ KYC doanh nghiệp (`evidence_urls`), ghi chú duyệt nội bộ của Admin (`review_notes`), token DNS challenge. | Khớp 100%: Payload trả về sạch sẽ, che giấu 100% dữ liệu nhạy cảm của nhà cung cấp. | High | Pass |
| **[Detail-5]**| Truy cập chi tiết một API đang ở trạng thái Bản nháp (Draft) | API ID = 1 đang là Draft | 1. Gõ trực tiếp URL `http://localhost:5173/marketplace/1`.<br>2. Quan sát phản hồi. | ID: `1` (Draft) | Hệ thống trả về lỗi HTTP 404 Not Found; giao diện hiển thị: "Không tìm thấy API hoặc API chưa được công khai." | Khớp 100%: Người dùng nhận mã 404; không để lộ thông tin của API đang nháp. | High | Pass |
| **[Detail-6]**| Truy cập ID không tồn tại hoặc sai định dạng ký tự | Không phụ thuộc | 1. Gõ URL `http://localhost:5173/marketplace/invalid-id` hoặc `999999`. | ID: `invalid-id` | Hệ thống trả về lỗi 400 hoặc 404 Not Found an toàn, không sập trang. | Khớp 100%: Trang hiển thị giao diện báo lỗi 404 Not Found thân thiện. | Medium | Pass |

---

## MODULE 14 (US-18): THỬ NGHIỆM TRỰC QUAN (API PLAYGROUND) & PHÒNG CHỐNG SSRF
- **Đường dẫn màn hình:** `http://localhost:5173/marketplace/:id/playground`
- **Mã nguồn liên quan:** `frontend/src/pages/marketplace/ApiPlaygroundPage.tsx`, `backend/src/playground-proxy.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Play-1]**| Hiển thị giao diện Playground với các trường tham số của Endpoint | Đang xem chi tiết API hợp lệ | 1. Nhấp nút "Thử nghiệm trên Playground".<br>2. Chọn một Endpoint (VD: `GET /weather/current`). | Không có | Giao diện nạp sẵn: Method, Endpoint Path, các ô nhập Query Params, Request Headers và Body Editor. | Khớp 100%: Giao diện Playground hiển thị đầy đủ công cụ gửi request và panel kết quả. | Medium | Pass |
| **[Play-2]**| Thực thi gửi Request thử nghiệm thành công qua Proxy | Upstream mock server đang hoạt động | 1. Nhập Query param: `city=Hanoi`.<br>2. Nhấp nút "Gửi Yêu Cầu" (Send Request).<br>3. Quan sát kết quả phản hồi. | Param: `city=Hanoi` | - Panel kết quả hiển thị Status Code `200 OK`.<br>- Hiển thị thời gian phản hồi (Latency, VD: `45 ms`).<br>- Body phản hồi định dạng JSON đẹp mắt (Pretty Print). | Khớp 100%: Proxy chuyển tiếp thành công; đo thời gian phản hồi và hiện JSON kết quả. | High | Pass |
| **[Play-3]**| Kiểm tra gửi kèm Header tùy chỉnh (Custom Headers) | Đang ở màn hình Playground | 1. Thêm Header `X-Custom-Tracking: Test123`.<br>2. Nhấp "Gửi Yêu Cầu". | Header tùy chỉnh | Header được proxy chuyển tiếp nguyên vẹn tới máy chủ upstream. | Khớp 100%: Header tùy chỉnh được gửi thành công. | Medium | Pass |
| **[Play-4]**| Kiểm tra gửi Payload JSON Body với Method POST | Endpoint hỗ trợ POST | 1. Chọn Endpoint `POST /data`.<br>2. Nhập JSON Body: `{"name": "Sensor 1", "val": 28.5}`.<br>3. Nhấp "Gửi Yêu Cầu". | JSON Body hợp lệ | Server phản hồi `201 Created` kèm body xác nhận dữ liệu đã được ghi nhận. | Khớp 100%: Gửi POST body thành công qua Proxy Playground. | High | Pass |
| **[Play-5]**| Gửi Payload JSON lỗi cú pháp trong Body Editor | Đang ở tab JSON Body | 1. Nhập chuỗi JSON hỏng: `{"name": "Sensor 1",` (thiếu đóng ngoặc).<br>2. Nhấp "Gửi Yêu Cầu". | JSON cú pháp lỗi | Trình biên dịch hiển thị cảnh báo lỗi cú pháp JSON và chặn gửi request. | Khớp 100%: Trình duyệt cảnh báo cú pháp JSON không hợp lệ; ngăn gửi request hỏng. | Medium | Pass |
| **[Play-6]**| Kiểm thử an ninh (Anti-SSRF): Chặn gọi tới địa chỉ Loopback `127.0.0.1` | Cố tình cấu hình target IP nội bộ | 1. Gửi request thử nghiệm trỏ tới `http://127.0.0.1:5432` hoặc `localhost`.<br>2. Nhấp "Gửi Yêu Cầu". | Target: `http://127.0.0.1:5432` | Hệ thống phòng chống SSRF kích hoạt; chặn request và trả về lỗi: "Truy cập vào địa chỉ mạng nội bộ bị nghiêm cấm (Anti-SSRF Policy)." | Khớp 100%: Proxy chặn đứng yêu cầu tới loopback; bảo vệ an toàn CSDL máy chủ. | High | Pass |
| **[Play-7]**| Kiểm thử an ninh (Anti-SSRF): Chặn gọi tới địa chỉ Cloud Metadata `169.254.169.254` | Không phụ thuộc | 1. Gửi request tới `http://169.254.169.254/latest/meta-data/`. | Target: Link AWS/GCP Metadata | Hệ thống chặn tức thì; trả về lỗi HTTP 400/403 SSRF Blocked; không rò rỉ token máy chủ đám mây. | Khớp 100%: Địa chỉ link-local bị chặn tuyệt đối bởi thuật toán kiểm tra IP blacklist. | High | Pass |
| **[Play-8]**| Kiểm tra cơ chế giới hạn thời gian chờ phản hồi (Timeout Protection) | Upstream bị treo không phản hồi | 1. Gửi request tới endpoint có độ trễ > 10 giây.<br>2. Quan sát phản hồi. | Timeout simulation | Playground ngắt kết nối sau 10 giây (Timeout); hiển thị lỗi thân thiện: "Yêu cầu đã hết thời gian chờ phản hồi (Gateway Timeout 504)." | Khớp 100%: Cơ chế ngắt timeout hoạt động chính xác; giải phóng kết nối proxy an toàn. | Medium | Pass |

---

## MODULE 15 (US-19): DÙNG THỬ API & HẠN NGẠCH SANDBOX (TRY BEFORE SUBSCRIBE)
- **Đường dẫn màn hình:** `http://localhost:5173/marketplace/:id/sandbox`
- **Mã nguồn liên quan:** `frontend/src/pages/marketplace/TrySandboxPage.tsx`, `backend/src/sandbox-quota.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Try-1]** | Khởi tạo Phiên dùng thử Sandbox cho Consumer | Đã đăng nhập vai trò Consumer | 1. Vào trang Sandbox của API `/marketplace/:id/sandbox`.<br>2. Nhấp nút "Bắt đầu dùng thử miễn phí". | Không có | - Hệ thống cấp phiên Sandbox kèm API Key dùng thử tạm thời.<br>- Hiển thị thanh hạn ngạch ban đầu: "0 / 100 yêu cầu (Còn lại 100)". | Khớp 100%: Phiên dùng thử được tạo; hiển thị thanh tiến trình hạn ngạch 0/100. | High | Pass |
| **[Try-2]** | Kiểm tra cập nhật hạn ngạch khi gọi request dùng thử thành công | Đang có phiên Sandbox còn hạn ngạch | 1. Nhấp nút "Gửi Yêu Cầu Thử Nghiệm".<br>2. Quan sát thanh hạn ngạch sau khi có response 200. | Gọi 1 request | Số yêu cầu đã dùng tăng lên: "1 / 100 yêu cầu (Còn lại 99)". Dữ liệu hạn ngạch giảm trừ theo thời gian thực. | Khớp 100%: Bộ đếm hạn ngạch tăng chính xác sau mỗi lần gọi thành công. | High | Pass |
| **[Try-3]** | Cố tình gọi vượt quá hạn ngạch cho phép (> 100 request) | Hạn ngạch đã chạm ngưỡng 100/100 | 1. Tiếp tục nhấp nút gửi request khi đã hết 100 yêu cầu.<br>2. Quan sát kết quả phản hồi. | Request thứ 101 | Hệ thống từ chối với mã lỗi HTTP 429 Too Many Requests; hiển thị popup: "Bạn đã dùng hết hạn ngạch thử nghiệm miễn phí hôm nay. Vui lòng đăng ký gói cước chính thức." | Khớp 100%: HTTP 429; popup hướng dẫn nâng cấp gói cước hiển thị rõ ràng. | High | Pass |
| **[Try-4]** | Kiểm tra hiển thị nút chuyển đổi nâng cấp sang Gói cước chính thức | Khi hết hạn ngạch dùng thử | 1. Nhấp vào nút "Nâng cấp gói cước" trên thông báo hết hạn ngạch. | Nhấp nút nâng cấp | Trình duyệt chuyển hướng mượt mà sang tab "Bảng giá" của API đó để tiến hành đăng ký gói cước. | Khớp 100%: Điều hướng chính xác sang màn hình đăng ký gói cước trả phí. | Medium | Pass |
| **[Try-5]** | Kiểm tra cơ chế tự động làm mới hạn ngạch hàng ngày (Daily Reset) | Phiên dùng thử qua 00:00 UTC | 1. Mô phỏng qua ngày mới trong CSDL (`last_reset_date = YESTERDAY`).<br>2. Tải lại trang Sandbox. | Qua ngày mới | Hạn ngạch tự động được đặt lại về 0: "0 / 100 yêu cầu". Người dùng tiếp tục được thử nghiệm. | Khớp 100%: Cơ chế reset hạn ngạch theo ngày hoạt động chính xác. | Medium | Pass |
| **[Try-6]** | Kiểm soát gian lận: Mỗi tài khoản Consumer chỉ có 1 phiên Sandbox hoạt động | Đã có phiên Sandbox cho API đó | 1. Cố tình gửi yêu cầu cấp thêm key Sandbox thứ hai cho cùng 1 API. | Yêu cầu trùng lặp | Hệ thống trả về phiên Sandbox hiện có, không cho phép tạo thêm để lách hạn ngạch. | Khớp 100%: Ràng buộc unique constraint giữ nguyên phiên hiện tại, chống gian lận hạn ngạch. | High | Pass |

---

## MODULE 16 (US-21): KHỞI TẠO & QUẢN LÝ KHÓA API (API KEY LIFECYCLE)
- **Đường dẫn màn hình:** `http://localhost:5173/dashboard/keys`
- **Mã nguồn liên quan:** `frontend/src/pages/consumer/ApiKeysPage.tsx`, `backend/src/consumer-service.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Key-1]** | Kiểm tra hiển thị giao diện Quản lý Khóa và Modal Khởi tạo | Đã đăng nhập vai trò Consumer | 1. Mở trang `/dashboard/keys`.<br>2. Nhấp nút "Tạo API Key mới".<br>3. Quan sát Modal hiện lên. | Không có | - Tiêu đề modal: "Tạo API Key Mới".<br>- Có trường "API ID (Bắt buộc) *" (placeholder "e.g. 1").<br>- Có trường "Tên gợi nhớ (Label - Tùy chọn)".<br>- Nút "Tạo Khóa" ban đầu bị vô hiệu hóa (`disabled: true`). | Khớp 100%: Modal mở ra với đúng các trường và nút submit bị vô hiệu hóa khi ô ID rỗng. | Medium | Pass |
| **[Key-2]** | Bỏ trống trường API ID (Force Errors) | Đang mở modal tạo khóa | 1. Để trống trường "API ID".<br>2. Nhập nhãn tùy chọn: "Dev Key".<br>3. Cố tình nhấp nút "Tạo Khóa". | API ID: `""`<br>Label: `Dev Key` | Nút "Tạo Khóa" duy trì trạng thái disabled, người dùng hoàn toàn không thể submit form rỗng. | Khớp 100%: Nút duy trì `disabled = true`, không thể gửi request rỗng lên server. | High | Pass |
| **[Key-3]** | Phân tích giá trị biên: Nhập API ID là số 0 hoặc số âm | Đang mở modal tạo khóa | 1. Nhập số `0` (hoặc `-3`) vào ô API ID.<br>2. Nhấp nút "Tạo Khóa". | API ID: `0` | Hệ thống kích hoạt validation regex `^[1-9][0-9]{0,9}$`; trình duyệt hiển thị lỗi: "Please match the requested format." | Khớp 100%: Regex kiểm tra số nguyên dương kích hoạt, chặn giá trị 0 và số âm. | High | Pass |
| **[Key-4]** | Phân vùng không hợp lệ: Nhập chuỗi ký tự chữ vào ô API ID | Đang mở modal tạo khóa | 1. Nhập `abc` vào ô API ID.<br>2. Nhấp nút "Tạo Khóa". | API ID: `abc` | Vi phạm định dạng pattern số nguyên dương; trình duyệt hiện tooltip HTML5 báo lỗi format. | Khớp 100%: Tooltip HTML5 kích hoạt: "Please match the requested format." | High | Pass |
| **[Key-5]** | Phân vùng không hợp lệ: API ID không tồn tại trong hệ thống | Đang mở modal tạo khóa | 1. Nhập số `999999` vào ô API ID.<br>2. Nhấp nút "Tạo Khóa". | API ID: `999999` | Backend trả về HTTP 404; modal xuất hiện alert đỏ: "API không tồn tại hoặc chưa được công khai." | Khớp 100%: HTTP 404 Not Found; hiển thị thông báo lỗi rõ ràng trên modal. | High | Pass |
| **[Key-6]** | Kiểm tra ràng buộc duy nhất: Tạo khóa trùng lặp cho API đã có khóa Active | API ID = 3 đã có khóa Active của người dùng | 1. Nhập API ID `3`.<br>2. Nhập nhãn tùy ý.<br>3. Nhấp "Tạo Khóa". | API ID: `3` | Hệ thống từ chối với HTTP 409 Conflict: "Một khóa đang hoạt động đã tồn tại cho API này. Vui lòng rotate hoặc thu hồi khóa hiện tại trước." | Khớp 100%: HTTP 409 Conflict; hiển thị cảnh báo chống trùng lặp khóa. | High | Pass |
| **[Key-7]** | Luồng thành công (Happy Path): Sinh khóa và Hiển thị Secret 1 lần duy nhất | API ID = 7 hợp lệ và chưa có khóa | 1. Nhập API ID `7`.<br>2. Nhập nhãn "Production Cluster Key".<br>3. Nhấp "Tạo Khóa". | API ID: `7`<br>Label: `Production Cluster Key` | - Modal vàng xuất hiện: "Khóa API Của Bạn Đã Sẵn Sàng".<br>- Cảnh báo: "Đây là lần duy nhất bạn thấy toàn bộ chuỗi Secret...".<br>- Chuỗi khóa bắt đầu bằng `ak_live_` kèm nút Sao chép. | Khớp 100%: Modal hiển thị Secret Key an toàn đúng 1 lần duy nhất kèm cảnh báo bảo mật. | High | Pass |
| **[Key-8]** | Luồng Thu hồi khóa (Revoke Key Pathway) và đổi trạng thái | Đã có một khóa Active trên bảng danh sách | 1. Nhấp nút "Thu hồi" tại thẻ khóa.<br>2. Xác nhận thu hồi trên modal cảnh báo. | Không có | - Khóa bị vô hiệu hóa tức thì trên Gateway.<br>- Huy hiệu chuyển sang màu xám: "Đã thu hồi".<br>- Nút Thu hồi bị ẩn, ghi nhận thời điểm thu hồi. | Khớp 100%: Trạng thái chuyển thành "Đã thu hồi"; vô hiệu hóa quyền truy cập qua Gateway. | High | Pass |

---

## MODULE 17 (US-22): CỔNG ĐỊNH TUYẾN API GATEWAY (GATEWAY ROUTING FRAMEWORK)
- **Đường dẫn màn hình:** `/admin/gateway-operations`, Endpoint `/gateway/:apiSlug/*`
- **Mã nguồn liên quan:** `backend/src/gateway-router.ts`, `backend/src/gateway-rate-limiter.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Gate-1]**| Gọi tới API Gateway nhưng không truyền Header `X-API-Key` | Không có token | 1. Gửi request `GET /gateway/weather-api/v1/current` mà không kèm header `X-API-Key`. | Thiếu header auth | Gateway chặn tức thì với mã lỗi HTTP 401 Unauthorized; response body: `{"error": "API Key is required"}`. | Khớp 100%: Chặn request không có API Key với HTTP 401. | High | Pass |
| **[Gate-2]**| Gọi Gateway với API Key đã bị Thu hồi (Revoked Key) | Sử dụng key đã bị revoke ở test case [Key-8] | 1. Gửi request kèm header `X-API-Key: ak_live_revoked_key...`. | Khóa đã revoke | Gateway từ chối với HTTP 401 Unauthorized; response: `{"error": "API Key has been revoked or is inactive"}`. | Khớp 100%: Chặn thành công khóa đã thu hồi, bảo vệ an toàn cho nhà cung cấp. | High | Pass |
| **[Gate-3]**| Gọi Gateway với API Key hợp lệ và đang hoạt động | Key Active của API ID = 3 | 1. Gửi request kèm `X-API-Key: ak_live_valid_key...`.<br>2. Quan sát phản hồi. | Khóa Active hợp lệ | - Gateway xác thực thành công.<br>- Chuyển tiếp request tới máy chủ upstream.<br>- Nhận kết quả HTTP 200 OK từ upstream trả về cho client. | Khớp 100%: Proxy chuyển tiếp thành công; trả về kết quả 200 OK. | High | Pass |
| **[Gate-4]**| Kiểm tra cập nhật thời điểm sử dụng gần nhất (`last_used_at`) | Sau khi gọi thành công ở [Gate-3] | 1. Mở trang `/dashboard/keys`.<br>2. Quan sát trường "Sử dụng gần nhất" của thẻ khóa đó. | Không có | Cột "Sử dụng gần nhất" cập nhật thời gian vừa gọi (VD: "Vừa xong" hoặc giờ hiện tại), mà không để lộ chuỗi raw key. | Khớp 100%: Cập nhật chính xác dấu thời gian sử dụng gần nhất của khóa. | Medium | Pass |
| **[Gate-5]**| Kiểm tra thực thi giới hạn tần suất (Rate Limiting Enforcement) | Gói cước giới hạn 60 req/phút | 1. Gửi liên tiếp 65 requests trong vòng 30 giây bằng script tự động. | 65 requests | - Từ request 1 đến 60: Trả về 200 OK.<br>- Từ request 61 trở đi: Bị Gateway chặn với HTTP 429 Too Many Requests kèm header `Retry-After`. | Khớp 100%: Rate limiter kích hoạt chính xác tại ngưỡng 60 req/phút; trả về HTTP 429. | High | Pass |
| **[Gate-6]**| Kiểm tra phản hồi Gateway khi máy chủ upstream bị lỗi sập (502/504 Handling) | Máy chủ upstream bị tắt | 1. Tắt dịch vụ upstream mock.<br>2. Gửi request qua Gateway. | Upstream offline | Gateway bắt lỗi kết nối và trả về HTTP 502 Bad Gateway hoặc 504 Gateway Timeout thân thiện, không lộ stack trace nội bộ. | Khớp 100%: Trả về HTTP 502 Bad Gateway chuẩn RESTful, che giấu cấu trúc mạng nội bộ. | Medium | Pass |

---

## MODULE 18 (US-15): BÁO CÁO VI PHẠM & KIỂM DUYỆT API (REPORT & MODERATION)
- **Đường dẫn màn hình:** `/marketplace/:id/report`, `/admin/reports`
- **Mã nguồn liên quan:** `frontend/src/pages/admin/ReportsModerationPage.tsx`, `backend/src/reports-service.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Rep-1]** | Consumer gửi Báo cáo Vi phạm đối với một API có hành vi lừa đảo | Đã đăng nhập vai trò Consumer | 1. Tại trang chi tiết API, nhấp "Báo cáo vi phạm" (biểu tượng cờ).<br>2. Chọn Lý do: "Nội dung độc hại / Lừa đảo".<br>3. Nhập Mô tả: "API trả về dữ liệu giả mạo và chứa link phishing".<br>4. Nhấp "Gửi Báo Cáo". | Lý do: Lừa đảo<br>Mô tả: Chi tiết | Báo cáo được gửi thành công; xuất hiện thông báo: "Cảm ơn bạn. Báo cáo vi phạm đã được gửi tới Ban quản trị hệ thống." | Khớp 100%: Báo cáo vi phạm được tạo và lưu trữ trong bảng `api_reports`. | High | Pass |
| **[Rep-2]** | Gửi Báo cáo vi phạm nhưng bỏ trống ô Mô tả chi tiết (Force Errors) | Đang mở modal báo cáo vi phạm | 1. Chọn lý do vi phạm.<br>2. Để trống ô Mô tả.<br>3. Nhấp "Gửi Báo Cáo". | Mô tả: `""` | Hệ thống chặn gửi; hiển thị lỗi: "Vui lòng mô tả chi tiết nội dung vi phạm để Admin có căn cứ xử lý." | Khớp 100%: Form bắt buộc nhập mô tả chi tiết, chặn submit rỗng. | Medium | Pass |
| **[Rep-3]** | Admin xem danh sách Báo cáo vi phạm đang chờ xử lý | Đã đăng nhập Admin (`admin@example.com`) | 1. Vào URL `http://localhost:5173/admin/reports`.<br>2. Quan sát danh sách các khiếu nại. | Filter: `status=Pending` | Hiển thị đầy đủ danh sách khiếu nại kèm tên API bị báo cáo, người gửi, phân loại vi phạm và mô tả bằng chứng. | Khớp 100%: Bảng nạp đầy đủ danh sách khiếu nại cần xử lý của hệ thống. | Medium | Pass |
| **[Rep-4]** | Admin xử lý Khiếu nại bằng quyết định Tạm đình chỉ API (Suspend API) | Có báo cáo vi phạm hợp lệ | 1. Tại báo cáo vi phạm, nhấp "Đình chỉ API (Suspend)".<br>2. Nhập lý do đình chỉ: "Xác minh có hành vi phát tán mã độc".<br>3. Xác nhận xử phạt. | Quyết định: `Suspend` | - Trạng thái API bị đổi sang `Suspended` (Đã đình chỉ).<br>- Toàn bộ khóa API bị tạm ngắt trên Gateway.<br>- API bị gỡ bỏ ngay lập tức khỏi sàn Marketplace. | Khớp 100%: API chuyển trạng thái Suspended; bị gỡ bỏ khỏi Marketplace và Gateway. | High | Pass |
| **[Rep-5]** | Kiểm tra API bị đình chỉ không còn xuất hiện trên Marketplace | Thực hiện ngay sau test case [Rep-4] | 1. Mở trang Marketplace `/marketplace`.<br>2. Tìm kiếm tên API vừa bị đình chỉ. | Tên API bị đình chỉ | API hoàn toàn không xuất hiện trên kết quả tìm kiếm và bộ lọc. | Khớp 100%: API bị ẩn tuyệt đối trên giao diện người dùng công khai. | High | Pass |
| **[Rep-6]** | Admin Khôi phục lại API sau khi Provider khắc phục vi phạm (Restore API) | API đang ở trạng thái Suspended | 1. Tại trang Quản trị, nhấp "Khôi phục API (Restore)".<br>2. Xác nhận thao tác. | Quyết định: `Restore` | Trạng thái API chuyển lại thành `Published`. API xuất hiện trở lại trên sàn Marketplace và Gateway mở lại quyền truy cập. | Khớp 100%: Khôi phục API thành công; dữ liệu xuất hiện trở lại trên sàn. | High | Pass |

---

## MODULE 19 (US-05): QUẢN LÝ HỒ SƠ CÁ NHÂN & BẢO MẬT (USER PROFILE & SECURITY)
- **Đường dẫn màn hình:** `http://localhost:5173/profile`
- **Mã nguồn liên quan:** `frontend/src/pages/consumer/ProfileSettingsPage.tsx`, `backend/src/user-profile.ts`

| ID | Test Case Description | Inter-test case Dependence | Test Case Procedure | Test data | Expected Output | Actual Output | Priority | Result |
|:---|:---|:---|:---|:---|:---|:---|:---:|:---:|
| **[Prof-1]**| Xem thông tin hồ sơ cá nhân và vai trò hiện tại | Đã đăng nhập vai trò bất kỳ | 1. Nhấp menu Profile (vào `/profile`).<br>2. Quan sát các trường thông tin. | Không có | Hiển thị chính xác: Tên hiển thị, Địa chỉ Email (read-only), Vai trò tài khoản, Ngày tham gia và Trạng thái tài khoản. | Khớp 100%: Trang nạp đầy đủ thông tin định danh của người dùng hiện tại. | Medium | Pass |
| **[Prof-2]**| Cập nhật Tên hiển thị và Giới thiệu bản thân (Bio) thành công | Đang ở trang Profile | 1. Sửa Tên hiển thị: "Kỹ Sư Phần Mềm Senior".<br>2. Nhập Giới thiệu: "Chuyên gia phát triển hệ thống phân tán".<br>3. Nhấp "Lưu thay đổi". | Tên: `Kỹ Sư Phần Mềm Senior`<br>Bio: `Chuyên gia phát triển...` | Hệ thống lưu trữ thành công; hiển thị alert xanh: "Đã cập nhật hồ sơ cá nhân thành công." Tên mới cập nhật trên avatar góc phải. | Khớp 100%: Dữ liệu hồ sơ cập nhật thành công; avatar và header đồng bộ tên mới. | High | Pass |
| **[Prof-3]**| Đổi mật khẩu nhưng nhập sai Mật khẩu hiện tại | Đang ở mục "Đổi mật khẩu" | 1. Nhập ô Mật khẩu hiện tại: `WrongOldPass@123`.<br>2. Nhập Mật khẩu mới: `NewValidPass@1234`.<br>3. Nhập Xác nhận mật khẩu mới: `NewValidPass@1234`.<br>4. Nhấp "Đổi mật khẩu". | Mật khẩu cũ: Sai | Hệ thống từ chối với HTTP 400/401; hiển thị alert đỏ: "Mật khẩu hiện tại không chính xác." Mật khẩu không bị đổi. | Khớp 100%: Server kiểm tra mã băm mật khẩu cũ; báo lỗi chính xác khi không khớp. | High | Pass |
| **[Prof-4]**| Đổi mật khẩu với Mật khẩu mới dưới 12 ký tự (BVA Edge Case) | Đang ở mục "Đổi mật khẩu" | 1. Nhập đúng Mật khẩu hiện tại.<br>2. Nhập Mật khẩu mới 10 ký tự: `ShortPass1!`.<br>3. Nhập xác nhận: `ShortPass1!`.<br>4. Nhấp "Đổi mật khẩu". | Pass mới: 10 ký tự | Hệ thống chặn submit; alert đỏ: "Mật khẩu mới phải chứa ít nhất 12 ký tự." | Khớp 100%: Ràng buộc độ dài tối thiểu $\ge 12$ ký tự kích hoạt chuẩn xác. | High | Pass |
| **[Prof-5]**| Luồng Đổi mật khẩu thành công và Hủy phiên làm việc cũ | Đang có mật khẩu cũ hợp lệ | 1. Nhập đúng Mật khẩu hiện tại.<br>2. Nhập Mật khẩu mới hợp lệ: `NewSecurePassword@2026`.<br>3. Nhập đúng Xác nhận mật khẩu mới.<br>4. Nhấp "Đổi mật khẩu". | Mật khẩu mới hợp lệ $\ge 12$ ký tự | - Mật khẩu được cập nhật mã băm mới trong CSDL.<br>- Toàn bộ phiên làm việc trên các thiết bị khác bị hủy (Revoke refresh tokens).<br>- Hiển thị thông báo xanh thành công. | Khớp 100%: Đổi mật khẩu thành công; người dùng có thể đăng nhập bằng mật khẩu mới. | High | Pass |
| **[Prof-6]**| Kiểm tra đăng nhập lại bằng Mật khẩu cũ sau khi đã đổi thành công | Thực hiện ngay sau test case [Prof-5] | 1. Đăng xuất tài khoản.<br>2. Cố tình nhập Mật khẩu cũ trước đó.<br>3. Nhấp "Đăng nhập". | Mật khẩu cũ | Đăng nhập bị từ chối với HTTP 401; hiển thị lỗi: "Email hoặc mật khẩu không chính xác...". | Khớp 100%: Mật khẩu cũ bị vô hiệu hóa hoàn toàn; tài khoản an toàn tuyệt đối. | High | Pass |

---

## BẢNG THỐNG KÊ TỔNG KẾT BỘ TEST CASES TOÀN DIỆN SPRINT 1, 2, 3

| Nhóm Sprint | Mã Module | Tên tính năng nghiệp vụ | Số lượng Test Cases | Tỷ lệ Pass thực tế | Mức độ bao phủ kiểm thử |
|:---|:---|:---|:---:|:---:|:---|
| **Sprint 1** | US-01 | Đăng ký tài khoản người dùng (Register) | 8 | 100% Pass | UI, Force Errors, BVA, Duplicate, Happy path, XSS |
| **Sprint 1** | US-02 | Xác thực Đăng nhập & Đăng xuất (Auth) | 8 | 100% Pass | UI, Force Errors, 401 Security, Trim/Case, Happy, SQLi |
| **Sprint 1** | US-03 | Phân quyền truy cập & Route Guard (RBAC) | 6 | 100% Pass | 401/403 Guards, Guest, Consumer $\to$ Admin, Menu dynamic |
| **Sprint 1** | US-04 | Admin Quản trị Người dùng (User Mgmt) | 6 | 100% Pass | List, Search, Lock user, Block login, Unlock, RBAC PATCH |
| **Sprint 2** | US-06 | Hồ sơ Xác minh Nhà cung cấp (KYC) | 8 | 100% Pass | UI, Empty fields, Disallowed FTP, Agreement, Whitespace, Lock |
| **Sprint 2** | US-07 | Admin Phê duyệt & Từ chối KYC (Moderation) | 6 | 100% Pass | Pending list, Tab view, Reject reason required, Approve, Conflict |
| **Sprint 2** | US-08 | Khai báo Pháp lý & Xác minh Tên miền | 6 | 100% Pass | Agreement active, GDPR data, TXT challenge, DNS verify |
| **Sprint 2** | US-09, 10 | Quản lý API, Endpoint & OpenAPI Docs | 8 | 100% Pass | Wizard create, Endpoint add, Malformed JSON, Import 3.0 |
| **Sprint 2** | US-11 | Cấu hình Gói cước Dịch vụ (Pricing) | 6 | 100% Pass | Free 0đ, Paid rate limit, Negative price, Deactivate/Active |
| **Sprint 2** | US-12, 13 | Nộp duyệt & Xuất bản API (Publishing) | 8 | 100% Pass | Checklist lock, Submit review, Reject reason, Publish $\to$ Market |
| **Sprint 2** | US-14 | Nhật ký Kiểm toán Quản trị (Audit Logs) | 5 | 100% Pass | Event list, Action filter, Date range, Immutability, RBAC |
| **Sprint 3** | US-16 | Khám phá, Tìm kiếm & Lọc Marketplace | 8 | 100% Pass | Guest, Search case-insensitive, Special %, AND filter, Sort |
| **Sprint 3** | US-17 | Chi tiết API & Tài liệu Công khai (Docs) | 6 | 100% Pass | Swagger view, Plans, Masked sensitive KYC, 404 Draft/Suspended |
| **Sprint 3** | US-18 | Thử nghiệm Trực quan & Chống SSRF | 8 | 100% Pass | Proxy params, 200 latency, POST body, Anti-SSRF 127.0.0.1, Timeout |
| **Sprint 3** | US-19 | Dùng thử API & Hạn ngạch Sandbox | 6 | 100% Pass | Sandbox key, Call count 1/100, 429 quota exceed, Upgrade link |
| **Sprint 3** | US-21 | Khởi tạo & Quản lý Khóa API Gateway | 8 | 100% Pass | Modal, Force errors, BVA 0/negative, 409 conflict, One-time secret |
| **Sprint 3** | US-22 | Cổng định tuyến API Gateway | 6 | 100% Pass | Missing key 401, Revoked 401, Upstream 200, Rate limit 429, 502 |
| **Sprint 3** | US-15 | Báo cáo Vi phạm & Kiểm duyệt API | 6 | 100% Pass | Submit report, Reason required, Suspend API, Delisted, Restore |
| **Sprint 3** | US-05 | Quản lý Hồ sơ Cá nhân & Đổi Mật khẩu | 6 | 100% Pass | Update name/bio, Verify old pass, Min 12 chars, Invalidate session |
| **TỔNG CỘNG** | **19 Modules**| **Toàn bộ User Stories Sprint 1, 2, 3** | **129** | **100% PASS** | **Đầy đủ 5 nhóm: UI, Empty, BVA/EP, Happy, Security** |

---
*Tài liệu kiểm thử toàn diện này được lập bởi QA Lead, phục vụ báo cáo bảo vệ đồ án Công nghệ Phần mềm theo chuẩn Ian Sommerville.*

