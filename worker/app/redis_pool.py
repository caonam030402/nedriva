"""Cached async Redis connection pool for FastAPI routes."""
from arq.connections import ArqRedis, RedisSettings

from app.config import get_settings

_redis_pool: ArqRedis | None = None


async def get_redis_pool() -> ArqRedis:
    """Return a cached ArqRedis connection."""
    global _redis_pool
    if _redis_pool is None:
        settings = RedisSettings.from_dsn(get_settings().redis_url)
        _redis_pool = await ArqRedis.from_host(
            host=settings.host,
            port=settings.port,
            database=settings.database,
            password=settings.password,
            ssl=settings.ssl,
        )
    return _redis_pool
