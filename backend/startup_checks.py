from __future__ import annotations

import os
import sqlite3
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
    # Root .env is preferred for backend values; fallback to frontend/.env for current repo layout.
    repo_root = Path(__file__).resolve().parents[1]
    root_env = repo_root / ".env"
    frontend_env = repo_root / "frontend" / ".env"

    _load_env_file(root_env, override=False)
    _load_env_file(frontend_env, override=False)


def _sqlite_db_path() -> Path:
    repo_root = Path(__file__).resolve().parents[1]
    configured = os.getenv("SQLITE_DB_PATH", "").strip()
    if configured:
        return Path(configured).expanduser().resolve()
    return (repo_root / "backend" / "data" / "gigatax.db").resolve()


def check_database_connectivity() -> None:
    _load_env()

    db_path = _sqlite_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with sqlite3.connect(db_path) as conn:
            cur = conn.cursor()
            cur.execute("PRAGMA journal_mode=WAL;")
            cur.execute("SELECT 1;")
            cur.fetchone()
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "SQLite connectivity check failed. Verify SQLITE_DB_PATH permissions and local disk accessibility. "
            f"Original error: {exc}"
        ) from exc


if __name__ == "__main__":
    check_database_connectivity()
    print("Database connectivity check passed.")
