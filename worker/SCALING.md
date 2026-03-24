# Tối ưu scale cho nhiều user xử lý đồng thời

## Tổng quan

Hệ thống có 3 queue riêng (image, video, bg_remover) → job ảnh không block video và ngược lại. Để phục vụ nhiều user hơn, tối ưu theo các hướng sau.

---

## 1. Horizontal scaling (thêm worker instance)

**Cách hiệu quả nhất** — chạy nhiều process/máy, cùng dùng 1 Redis.

```
Máy 1: python worker.py     # 3 worker (image + video + bg)
Máy 2: python worker.py     # thêm 3 worker nữa
Máy 3: python worker.py     # thêm 3 worker nữa
```

→ **3 máy = 3x throughput**. arq tự phân chia job qua Redis.

**Docker Compose / K8s:** scale replicas của worker service.

```yaml
# docker-compose.yml
services:
  worker:
    image: nedriva-worker
    deploy:
      replicas: 3
```

---

## 2. Tách worker theo tài nguyên

Nếu mỗi loại cần tài nguyên khác nhau:

| Loại | Tài nguyên chính | Gợi ý |
|------|------------------|-------|
| **image** | GPU (Real-ESRGAN, GFPGAN) | Máy có GPU, `max_jobs=1` |
| **video** | CPU + RAM (ffmpeg) | Máy CPU mạnh |
| **bg_remover** | CPU + RAM (rembg) | Có thể chạy chung với video |

Có thể tạo 3 entry point riêng và chạy mỗi loại trên máy phù hợp:

```python
# worker.py — thêm tùy chọn --queue
# Ví dụ: python worker.py --queue image
```

Hoặc chạy 3 container:
- `worker_image` (1 replica, máy GPU)
- `worker_video` (2–3 replica, máy CPU)
- `worker_bg` (2 replica, máy CPU)

---

## 3. max_jobs (song song trong 1 process)

Mặc định `max_jobs=1` vì pipeline chủ yếu CPU/GPU-bound.

Có thể tăng qua env:

```bash
# .env
MAX_JOBS_IMAGE=2       # 2 job ảnh song song (cần đủ RAM/GPU)
MAX_JOBS_VIDEO=1       # video tốn CPU, giữ 1
MAX_JOBS_BG_REMOVER=2  # rembg nhẹ hơn, có thể 2
```

- **Image/Video:** thường nên giữ 1 nếu dùng GPU hoặc CPU đơn.
- **bg_remover:** có thể thử 2–4 nếu RAM đủ.

---

## 4. Redis

- Dùng Redis riêng, không share với app khác.
- Nếu nhiều worker: cân nhắc Redis Cluster.
- Cấu hình: `maxmemory`, eviction policy phù hợp.

---

## 5. Rate limiting & thứ tự ưu tiên

- **Rate limit theo user:** giới hạn số job đang chờ mỗi user.
- **Job priority:** user trả phí → queue riêng hoặc ưu tiên cao hơn (cần mở rộng arq).

---

## 6. Tóm tắt nhanh

| Mục tiêu | Hành động |
|----------|-----------|
| Thêm throughput chung | Chạy thêm `worker.py` (horizontal scaling) |
| Tận dụng GPU | Chạy image worker trên máy GPU |
| Giảm thời gian chờ | Tăng số máy worker, không tăng `max_jobs` quá mức |
| Tối chỉnh | Dùng `MAX_JOBS_*` trong .env |
