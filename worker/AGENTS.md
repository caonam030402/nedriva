# AGENTS — Nedriva Worker (Python)

## Project Overview

Async FastAPI + arq worker service for AI image/video processing. Three independent queues:

- `image` — Real-ESRGAN upscale + GFPGAN face restoration + rembg background removal
- `video` — ffmpeg-based video enhancement
- `bg_remover` — rembg background removal (standalone)

Entry point: `worker.py` runs all three queues concurrently via `asyncio.gather`.

## Project Structure

```
worker/
├── worker.py               # Entry point — runs all 3 queues
├── app/
│   ├── main.py             # FastAPI app
│   ├── config.py           # Settings (pydantic BaseSettings)
│   ├── compat.py           # PyTorch/torch.compile polyfill
│   ├── storage.py          # S3/R2 upload/download
│   ├── queue.py            # arq WorkerSettings factories
│   └── api/
│       └── common.py       # verify_api_key dependency
└── app/modules/
    ├── image_enhancer/
    │   ├── pipeline.py     # Real-ESRGAN + GFPGAN + rembg pipeline
    │   ├── worker.py       # process_image_job (arq function)
    │   ├── queue.py        # Redis helpers (set/get job status)
    │   ├── routes.py       # FastAPI router
    │   └── schemas.py      # Pydantic request/response models
    ├── video_enhancer/
    │   ├── pipeline.py     # ffmpeg enhancement pipeline
    │   ├── worker.py       # process_video_job
    │   ├── queue.py
    │   ├── routes.py
    │   └── schemas.py
    └── background_remover/
        ├── pipeline.py     # rembg pipeline
        ├── worker.py       # process_bg_removal_job
        ├── queue.py
        ├── routes.py
        └── schemas.py
```

## Principles

- All inference runs in `asyncio.to_thread` (non-blocking) so the event loop stays responsive.
- Worker uses `asyncio.wait_for` + timeout to enforce per-job timeouts.
- Redis is the single source of truth for job status; HTTP webhook notifies Next.js on completion.
- Module-level singletons (pipelines, Redis pool) are reused across jobs for efficiency.
- No `any` types. All function signatures typed. Enums for status, model choice, size mode.
- Comments in English only. Docstrings in English.

## Conventions

### Module `__init__.py`

Re-exports public API. Never import pipeline internals from outside the module.

### Schemas

- Request models use Pydantic with validation. Field defaults match config defaults.
- Enum values are string literals (stored in Redis, no serialization issues).
- Response models include `None` for optional fields; no sentinel values.

### Worker functions

- Named `process_<job>_job`.
- Always update Redis status at: `queued → processing → completed/failed`.
- On completion, call `_send_webhook(result)` for image and bg_remover.
- On timeout/error, set status to `failed` with a descriptive `error` field.

### Queue helpers

- `get_redis_pool()` — cached Redis connection pool (async).
- `set_job_status(redis, job_id, data)` — sets Redis hash + expires.
- `get_job_data(redis, job_id)` — returns dict or None.

### Config

- All settings via `Settings` (pydantic BaseSettings, reads `.env`).
- No hardcoded timeouts, URLs, or credentials.
- Add new settings to `config.py`, not inline in worker/pipeline code.

## API Routes

All routes live inside `modules/<name>/routes.py`. Import pattern:

```python
from app.modules.image_enhancer.routes import image_enhancer_router
```

Routes are registered in `main.py` with a versioned prefix (`/api/v1/...`).

## Running

```bash
# All queues
python worker.py

# Single queue (if ever needed)
python -m app.modules.image_enhancer.worker
```

## Adding a New Module

1. Create `app/modules/<new_module>/` with: `pipeline.py`, `worker.py`, `queue.py`, `routes.py`, `schemas.py`, `__init__.py`.
2. Add `WorkerSettings` factory in `app/queue.py`.
3. Import router in `app/main.py` and register with a prefix.
4. Export from `app/modules/<new_module>/__init__.py`.
