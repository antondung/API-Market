# API demo cho Provider — Sprint 2 (EN-07)

Ba API mẫu để Provider đăng ký, kiểm thử luồng publish, và để Gateway chuyển tiếp ở Sprint 4.

Mỗi API gồm hai phần:

1. **File OpenAPI spec** trong `mock-services/<tên>/openapi.json` — Provider upload file này qua chức năng OpenAPI Import.
2. **Mock server** trong `mock-services/server.mjs` — trả dữ liệu thật để test end-to-end.

## Ba API

| API | Cổng | Endpoint | File spec |
|---|---|---|---|
| Weather Now API | 4011 | `GET /v1/weather?city=Hanoi` | `mock-services/weather/openapi.json` |
| Currency Rates API | 4012 | `GET /v1/rates?base=USD` | `mock-services/currency/openapi.json` |
| Product Catalog API | 4013 | `GET /v1/products` | `mock-services/catalog/openapi.json` |

## Cách chạy

### Cách 1 — Chạy trực tiếp bằng Node

```powershell
npm run demo:apis        # chạy cả ba
npm run demo:weather     # chỉ chạy Weather
npm run demo:currency    # chỉ chạy Currency
npm run demo:catalog     # chỉ chạy Catalog
```

### Cách 2 — Chạy bằng Docker

```powershell
docker compose --env-file .env.docker --profile demo up -d
```

Ba service nằm sau profile `demo`, nên `docker compose up` thường không dựng chúng.

### Kiểm tra

```powershell
curl "http://localhost:4011/v1/weather?city=Hanoi"
curl "http://localhost:4012/v1/rates?base=USD"
curl "http://localhost:4013/v1/products"
curl http://localhost:4011/health
```

## Dữ liệu mẫu

### Weather — 5 thành phố

| Thành phố | Nhiệt độ | Trạng thái | Độ ẩm |
|---|---|---|---|
| Hanoi | 31 | Cloudy | 78 |
| Ho Chi Minh | 33 | Sunny | 65 |
| Da Nang | 29 | Rainy | 88 |
| Tokyo | 22 | Clear | 55 |
| London | 14 | Drizzle | 82 |

### Currency — 4 loại tiền

`VND`, `USD`, `EUR`, `JPY`. Tham số `base` không bắt buộc, mặc định `VND`.

### Catalog — 4 sản phẩm

Có sản phẩm `inStock: false` để test trường hợp hết hàng.

## Trường hợp lỗi đã xử lý

| Trường hợp | Kết quả |
|---|---|
| Weather thiếu `city` | `400 MISSING_CITY` |
| Weather sai thành phố | `404 CITY_NOT_FOUND` |
| Currency sai mã tiền | `400 UNSUPPORTED_BASE` |
| Gọi sai đường dẫn | `404 NOT_FOUND` |
| Dùng POST thay vì GET | `405 METHOD_NOT_ALLOWED` |

## Địa chỉ trong mạng Docker

Khi Gateway gọi từ trong mạng compose, dùng tên service thay vì `localhost`:

| Từ máy host | Từ trong mạng compose |
|---|---|
| `http://localhost:4011` | `http://weather:4011` |
| `http://localhost:4012` | `http://currency:4012` |
| `http://localhost:4013` | `http://catalog:4013` |

File OpenAPI ghi `localhost` vì đó là địa chỉ dùng khi test trên máy. Khi cấu hình Gateway ở Sprint 4, cần đổi sang tên service.

## Lưu ý về domain verification

`provider-dns.ts` chặn `localhost` khi Provider tạo domain challenge, vì đó không phải domain công khai. Đây là thiết kế chống SSRF.

Vì vậy 3 API demo này **chỉ dùng để kiểm thử cục bộ và import OpenAPI**, không dùng để test luồng Domain Verification. Muốn test luồng đó cần một FQDN thật trỏ DNS TXT về bản ghi hệ thống cấp.

## Ghi chú

- Đây là dữ liệu giả cố định, không kết nối database, không gọi mạng ngoài.
- Server chỉ hỗ trợ `GET`, không cần xác thực.
- Không dùng cho production.
- Đổi cổng khi chạy trực tiếp: đặt biến `MOCK_PORT`.
