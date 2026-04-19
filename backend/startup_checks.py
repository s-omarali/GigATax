from __future__ import annotations

import os
from pathlib import Path


def _load_env_file(path: Path, *, override: bool = False) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if not key:
            continue
        if key in os.environ and not override:
            continue
        os.environ[key] = value


def _load_env() -> None:
    backend_dir = Path(__file__).resolve().parent
    repo_root = backend_dir.parent
    _load_env_file(backend_dir / ".env", override=False)
    _load_env_file(repo_root / "frontend" / ".env", override=False)


def check_database_connectivity() -> None:
    _load_env()

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env. "
            "Create a Supabase project and copy the credentials into your root .env file."
        )

    try:
        from supabase import create_client

        client = create_client(url, key)
        client.table("users").select("id").limit(1).execute()
    except Exception as exc:
        raise RuntimeError(
            f"Supabase connectivity check failed. Verify your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. "
            f"Also ensure the 'users' table exists (run the schema SQL in the Supabase dashboard). "
            f"Original error: {exc}"
        ) from exc


if __name__ == "__main__":
    check_database_connectivity()
    print("Supabase connectivity check passed.")
