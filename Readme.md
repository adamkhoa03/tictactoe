# TicTacToe Docker Deployment

## Chạy trên máy có source code

1. Copy toàn bộ thư mục `project` sang máy mới.
2. Đảm bảo máy mới đã cài Docker và Docker Compose.
3. Mở terminal trong thư mục gốc `project`.
4. Chạy lệnh:
   ```bash
docker compose up --build -d
```
5. Mở trình duyệt:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:5000/api/health`

## Build image và copy sang máy khác

### Trên máy cũ

1. Vào thư mục gốc:
   ```bash
cd project
```
2. Build image:
   ```bash
docker compose build
```
3. Lưu image ra file:
   ```bash
docker save -o tictactoe-backend.tar tictactoe-backend:latest
docker save -o tictactoe-frontend.tar tictactoe-frontend:latest
```
4. Nếu máy mới không có mạng để tải MongoDB, lưu thêm:
   ```bash
docker save -o mongo.tar mongo:7.0
```
5. Copy các file sau sang máy mới:
   - `docker-compose.yml`
   - `frontend/nginx.conf`
   - `tictactoe-backend.tar`
   - `tictactoe-frontend.tar`
   - nếu cần: `mongo.tar`

### Trên máy mới

1. Đảm bảo Docker và Docker Compose đã cài.
2. Copy các file vào cùng một thư mục.
3. Load image:
   ```bash
docker load -i tictactoe-backend.tar
docker load -i tictactoe-frontend.tar
```
4. Nếu có MongoDB image:
   ```bash
docker load -i mongo.tar
```
5. Chạy Docker Compose:
   ```bash
docker compose up -d
```
6. Mở trình duyệt:
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:5000/api/health`

## Lưu ý

- Máy mới phải có Docker.
- Nếu dùng `docker save/load`, không cần copy source code.
- Nếu dùng `docker compose up --build`, cần copy source code + Dockerfile.
- `docker-compose.yml` phải cùng phiên bản với image đã build.
- Môi trường cần đúng: `MONGO_URI`, `FRONTEND_URL` nếu thay đổi.
