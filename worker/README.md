# Nedriva — Python worker (processing service)

FastAPI service that runs AI image processing models. Communicates with the Next.js app via REST API + webhook.

## Stack

| Component | Technology |
|---|---|
| Web framework | FastAPI + Uvicorn |
| Job queue | arq (async Redis queue) |
| State storage | Redis |
| Upscaling | Real-ESRGAN (`realesrgan`) |
| Background removal | rembg (U2Net / ISNET) |
| Face enhancement | GFPGAN v1.4 |
| Light AI | OpenCV CLAHE + white balance |
| Storage | Cloudflare R2 (S3-compatible) |
| Container | Docker + CUDA 12.1 |

## Architecture

```
Next.js
  POST /api/process ──────────────► FastAPI /api/v1/process
                                         │ returns job_id immediately
  GET  /api/jobs/{id} ────────────► FastAPI /api/v1/jobs/{id}
                                         │ reads from Redis
                                    arq Worker
                                         │ downloads image
                                         │ runs pipeline
                                         │ uploads to R2
                                         ▼
                                    Webhook → Next.js /api/webhooks/process
```

## Quick Start

### With Docker (recommended)

```bash
cp .env.example .env
# Fill in: R2 keys, WEBHOOK_URL, API_SECRET_KEY

docker compose up
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### Mac + Docker (CPU) — jobs can take many minutes

Real-ESRGAN on **CPU inside Docker** on a Mac has **no GPU**; **5–15+ minutes per image** is normal for ~0.5MP input. To finish in roughly **2–5 minutes** for local testing:

1. Set **`MAX_INPUT_MP_CPU=0.15`**–`0.25` in `.env` (smaller = faster, lower quality).
2. Turn off **Remove background**, **Light AI**, **Try all** in the UI.
3. Use **Prime** or **Gentle** only; avoid extra-heavy presets while testing.
4. Rebuild/restart after changing `.env`: `docker compose up --build -d`.
5. For production speed you need **NVIDIA GPU** (cloud or PC), not Mac CPU Docker.

**Looks “same before/after” or extra-blurry:** With low `MAX_INPUT_MP_CPU`, the net sees a tiny image. If the pipeline then **resizes larger than the model’s native output** (e.g. 4×), the extra pixels are **LANCZOS only** — no new detail, like zooming. Default **`CPU_AVOID_LANCZOS_UPSCALE=true`** clamps output to real neural upscaling. For **visibly sharper** results (slower): raise `MAX_INPUT_MP_CPU` toward `1.0`–`2.0`. Super-resolution cannot fix a **severely out-of-focus** photo like a real refocus.

**UI “Auto” size:** Uses **`AUTO_UPSCALE_SCALE`** (default **2**) — same fast **RealESRGAN_x2plus** path as choosing **Scale → 2×**. Set **`AUTO_UPSCALE_SCALE=4`** in `.env` if you want the old behaviour (always **4×** output, much slower on CPU).

**Scale 1× vs 2× vs 4×:** `1×` skips Real-ESRGAN (same pixel size; use Light AI if you want tweaks). `2×` uses the smaller **x2** weights. `4×`/`8×`/`16×` use **x4** paths and produce **many more pixels** → much slower on CPU.

**Timeouts:** The Next.js client polls for **~32 minutes** (keep in line with `JOB_PIPELINE_TIMEOUT_S`, default **1800s**). The arq worker’s `job_timeout` follows the same setting. If jobs still fail, lower **`MAX_INPUT_MP_CPU`** and **`MAX_INPUT_MP_CPU_SCALE_GE_4`** (extra cap when scale ≥4 on CPU) so 4× finishes sooner, or use GPU.

**Remove background:** Output is **RGBA** → uploaded as **PNG** (JPEG cannot preserve transparency). Plain enhance without remove-bg stays **JPEG** when RGB.

### Without Docker (dev / CPU)

```bash
python -m venv .venv && source .venv/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

cp .env.example .env

# Terminal 1: API server
uvicorn app.main:app --reload --port 8000

# Terminal 2: Worker
python worker.py
```

## Environment Variables

See `.env.example` for all variables.

| Variable | Required | Description |
|---|---|---|
| `API_SECRET_KEY` | ✅ | Shared secret with Next.js (`x-api-key` header) |
| `REDIS_URL` | ✅ | Redis connection string |
| `STORAGE_ENDPOINT_URL` | ✅ | R2 endpoint URL |
| `STORAGE_ACCESS_KEY` | ✅ | R2 / S3 access key |
| `STORAGE_SECRET_KEY` | ✅ | R2 / S3 secret key |
| `STORAGE_BUCKET` | ✅ | Bucket name |
| `STORAGE_PUBLIC_BASE_URL` | ✅ | Public URL prefix for output files |
| `WEBHOOK_URL` | recommended | Next.js webhook endpoint |
| `WEBHOOK_SECRET` | recommended | Verifies webhook origin |

## Processing Pipeline

Order for each job:

1. **Upscale** — Real-ESRGAN (model depends on preset below)
2. **Face / Old photo** — see table
3. **Light AI** — optional user toggle (plus automatic pass for Old Photo on CPU when GFPGAN is skipped)
4. **Remove background** — rembg (if enabled, last)

### Preset behaviour (important)

| UI preset | Upscale weights | After upscale (GPU) | After upscale (CPU, default `SKIP_FACE_ENHANCE_ON_CPU=true`) |
|-----------|-----------------|---------------------|----------------------------------------------------------------|
| **Prime** | General **x2** (UI Auto default) or x4 / More sub-models | GFPGAN faces 0.5 | GFPGAN **skipped** — faster, no face polish |
| **Gentle** | Anime **x4** only (no x2 weights) | *(no GFPGAN)* | **Auto** still runs one **x4** forward → slower than Prime Auto on CPU |
| **Old photo** | General **x2** (Auto default) or x4 | **GFPGAN** face restore | **Light AI ~80%** fallback on CPU if GFPGAN skipped. **B&W input → sharper B&W output** — no **AI colorization** in this repo (needs e.g. DeOldify / DDColor or an external API). |
| **Try all** | Runs Prime + Gentle + Old ×3 | 3 full pipelines | **3× CPU time** — avoid on Mac Docker for testing |

**Scale 1×** skips Real-ESRGAN (same pixel size); use Light AI if you want tweaks without resizing.

**try_all** model runs Prime + Gentle + Old Photo independently → 3 output images.

## API Endpoints

### `POST /api/v1/process`
Enqueue a job. Returns `{ job_id }` immediately.

Headers: `x-api-key: <API_SECRET_KEY>`

Body (JSON): see `ProcessRequest` in `app/schemas.py`

### `GET /api/v1/jobs/{job_id}`
Poll job status. Returns `JobStatusResponse`.

```json
{
  "job_id": "abc123",
  "queue_item_id": "item-1",
  "status": "done",
  "output_url": "https://...",
  "outputs": ["https://..."],
  "processing_ms": 4200
}
```

### `GET /api/v1/health`
Health check. Lists warm models in cache.

## Production Deployment

Deploy on any GPU cloud (RunPod, Lambda Labs, Vast.ai, AWS G4):

```bash
# Build image
docker build -t pixelai-service .

# Run with GPU
docker run --gpus all -p 8000:8000 --env-file .env pixelai-service

# Run worker separately
docker run --gpus all --env-file .env pixelai-service python worker.py
```

Model weights (~700MB for GFPGAN, ~70MB for Real-ESRGAN) are downloaded on first use and cached in `/app/models`. Mount a volume to persist across restarts.
