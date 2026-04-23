from __future__ import annotations

import logging

from fastapi import HTTPException

from backend.db import get_supabase

logger = logging.getLogger(__name__)


def get_user_id(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        response = get_supabase().auth.get_user(token)
        return response.user.id
    except KeyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Server auth misconfiguration (missing Supabase env vars)",
        ) from exc
    except Exception as exc:
        logger.exception("Supabase token verification failed in get_user_id: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_auth_user(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        response = get_supabase().auth.get_user(token)
        return response.user
    except KeyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Server auth misconfiguration (missing Supabase env vars)",
        ) from exc
    except Exception as exc:
        logger.exception("Supabase token verification failed in get_auth_user: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid or expired token")
