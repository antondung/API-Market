# Frontend — React + TypeScript + Vite
# Sprint 1 chưa có mã nguồn frontend (issue #3). Dockerfile này được viết sẵn
# theo cấu trúc dự kiến để khi frontend được thêm vào thư mục frontend/ thì
# `docker compose up` chạy được ngay, không cần sửa compose.
#
# Cấu trúc frontend/ dự kiến:
#   frontend/package.json
#   frontend/package-lock.json
#   frontend/vite.config.ts
#   frontend/index.html
#   frontend/src/...

# =========================================
# Tầng 1: builder
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./

# Vite nhúng biến môi trường vào bundle lúc build, nên phải truyền khi build
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# =========================================
# Tầng 2: phục vụ file tĩnh bằng nginx
# =========================================
FROM nginx:1.27-alpine AS runtime

# Cấu hình SPA: mọi route không khớp file tĩnh đều trả index.html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]