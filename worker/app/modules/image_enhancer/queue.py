"""Image enhancer queue helpers — shared giữa API và worker."""
import json

from arq.connections import ArqRedis


# ── Redis state keys ────────────────────────────────────────────

def _key(job_id: str) -> str:
    return f"image_job:{job_id}"


# ── Set / Get ──────────────────────────────────────────────────

async def set_job_status(redis: ArqRedis, job_id: str, data: dict) -> None:
    await redis.hset(_key(job_id), mapping={k: json.dumps(v) for k, v in data.items()})
    await redis.expire(_key(job_id), 86400)


async def get_job_data(redis: ArqRedis, job_id: str) -> dict | None:
    raw = await redis.hgetall(_key(job_id))
    if not raw:
        return None
    return {k.decode(): json.loads(v) for k, v in raw.items()}
