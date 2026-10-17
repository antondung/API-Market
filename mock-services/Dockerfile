# Docker image cho 3 API demo Sprint 2 (EN-07)
#
# Một image dùng chung cho cả ba service; tên API truyền qua `command`.
# Ví dụ: command: ["weather"]
#
# Chỉ dùng Node runtime, không cần dependency ngoài.
FROM node:22-alpine

WORKDIR /app

# Chỉ copy phần cần thiết: server và spec của 3 API demo.
COPY mock-services/server.mjs ./mock-services/server.mjs
COPY mock-services/weather ./mock-services/weather
COPY mock-services/currency ./mock-services/currency
COPY mock-services/catalog ./mock-services/catalog

# Chạy bằng user không phải root.
USER node

EXPOSE 4011 4012 4013

CMD ["weather"]
