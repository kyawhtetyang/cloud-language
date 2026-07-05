from __future__ import annotations

import os

import uvicorn

from app.config import get_settings


def main() -> None:
    settings = get_settings()
    reload_enabled = os.getenv("UVICORN_RELOAD", "").strip().lower() in {"1", "true", "yes", "on"}
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=reload_enabled)


if __name__ == "__main__":
    main()
