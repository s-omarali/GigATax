from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

# Ensure imports resolve when executed as: python scripts/start_backend.py
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.startup_checks import check_database_connectivity


def main() -> int:
    check_database_connectivity()
    print("Startup DB check passed. Launching FastAPI with uvicorn...")

    app_target = os.getenv("APP_MODULE", "main:app")
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        app_target,
        "--host",
        host,
        "--port",
        str(port),
    ]

    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
