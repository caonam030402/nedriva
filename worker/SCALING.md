# Scaling Optimization for Concurrent Users

## Overview

The system has 3 separate queues (`image`, `video`, `bg_remover`) — image jobs do not block video and vice versa. To serve more users, optimize along the following directions.

---

## 1. Horizontal Scaling (Adding Worker Instances)

**Most effective approach** — run multiple processes/machines sharing 1 Redis.

```
Machine 1: python worker.py     # 3 workers (image + video + bg)
Machine 2: python worker.py     # 3 more workers
Machine 3: python worker.py     # 3 more workers
```

→ **3 machines = 3x throughput**. arq auto-distributes jobs through Redis.

**Docker Compose / K8s:** scale replicas of the worker service.

```yaml
# docker-compose.yml
services:
  worker:
    image: nedriva-worker
    deploy:
      replicas: 3
```

---

## 2. Separate Workers by Resource Type

If each type needs different resources:

| Type | Primary Resource | Suggestion |
|------|-----------------|-----------|
| **image** | GPU (Real-ESRGAN, GFPGAN) | GPU machine, `max_jobs=1` |
| **video** | CPU + RAM (ffmpeg) | High-CPU machine |
| **bg_remover** | CPU + RAM (rembg) | Can co-run with video |

You can create 3 separate entry points and run each type on the right machine:

```python
# worker.py — add --queue option
# Example: python worker.py --queue image
```

Or run 3 containers:
- `worker_image` (1 replica, GPU machine)
- `worker_video` (2–3 replicas, CPU machine)
- `worker_bg` (2 replicas, CPU machine)

---

## 3. max_jobs (Parallelism Within a Single Process)

Default `max_jobs=1` because the pipeline is primarily CPU/GPU-bound.

Configure via env:

```bash
# .env
MAX_JOBS_IMAGE=2       # 2 image jobs in parallel (needs enough RAM/GPU)
MAX_JOBS_VIDEO=1       # video is CPU-heavy, keep at 1
MAX_JOBS_BG_REMOVER=2  # rembg is lighter, can do 2
```

- **Image/Video:** generally keep at 1 if using GPU or single CPU.
- **bg_remover:** try 2–4 if RAM is sufficient.

---

## 4. Redis

- Use a dedicated Redis, do not share with other apps.
- If running many workers: consider Redis Cluster.
- Configure: `maxmemory`, eviction policy as appropriate.

---

## 5. Rate Limiting & Priority

- **Per-user rate limit:** cap the number of pending jobs per user.
- **Job priority:** paid users → separate queue or higher priority (requires arq extension).

---

## 6. Quick Summary

| Goal | Action |
|------|--------|
| Increase overall throughput | Add more `worker.py` instances (horizontal scaling) |
| Leverage GPU efficiently | Run image worker on GPU machines |
| Reduce wait times | Add more worker machines; avoid pushing `max_jobs` too high |
| Fine-tune | Use `MAX_JOBS_*` in .env |
