# Backend API — Node.js 22 + TypeScript + Express 5
# Build nhiều tầng: tầng builder cài toàn bộ dependency và biên dịch TypeScript,
# tầng runtime chỉ giữ production dependency và mã đã biên dịch.

# =========================================
# Tầng 1: builder
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifest trước để tận dụng cache layer của Docker
COPY package.json package-lock.json ./

# npm ci cài đúng phiên bản trong lock file, gồm cả devDependency để build
RUN npm ci

# Copy mã nguồn và cấu hình TypeScript
COPY tsconfig.json ./
COPY backend ./backend
COPY migrations ./migrations
COPY scripts ./scripts

# Biên dịch TypeScript sang dist/
RUN npm run build


# =========================================
# Tầng 2: runtime
# =========================================
FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Chỉ cài production dependency, bỏ devDependency để image nhỏ và ít bề mặt tấn công
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Mã đã biên dịch
COPY --from=builder /app/dist ./dist

# Migration SQL được đọc lúc chạy bởi PostgresAuthStore (đường dẫn ../../migrations
# tính từ dist/src/postgres-store.js)
COPY --from=builder /app/migrations ./migrations

# Script tiện ích cho migrate/seed
COPY --from=builder /app/scripts ./scripts

# Chạy bằng user không phải root
USER node

EXPOSE 3000

# Health check dùng endpoint /health có sẵn trong app
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/server.js"]