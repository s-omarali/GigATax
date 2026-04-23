from __future__ import annotations

import os
from functools import lru_cache

from supabase import Client, create_client


def _get_first_non_empty(*names: str) -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value
    return ""


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = _get_first_non_empty("SUPABASE_URL", "SUPABASE_PROJECT_URL")
    key = _get_first_non_empty(
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_SERVICE_ROLE",
        "SUPABASE_SECRET_KEY",
    )

    missing: list[str] = []
    if not url:
        missing.append("SUPABASE_URL")
    if not key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        raise KeyError(
            "Missing required backend env vars: "
            + ", ".join(missing)
            + ". Configure them in Railway service Variables and redeploy."
        )

    return create_client(url, key)
