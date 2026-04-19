from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.db import get_supabase
from backend.startup_checks import _load_env
from backend.src.services.demo_transactions import seed_demo_rows_for_user


def _bootstrap_users_from_auth() -> int:
    sb = get_supabase()
    created = 0

    page = 1
    per_page = 200

    while True:
        response = sb.auth.admin.list_users(page=page, per_page=per_page)
        auth_users = getattr(response, "users", None) or []
        if not auth_users:
            break

        for auth_user in auth_users:
            sb.table("users").upsert(
                {
                    "id": auth_user.id,
                    "email": auth_user.email,
                    "full_name": (getattr(auth_user, "user_metadata", {}) or {}).get("full_name", ""),
                    "gigs": ["Content Creator"],
                    "state": "CA",
                    "estimated_marginal_tax_rate": 0.24,
                    "onboarding_completed": False,
                }
            ).execute()
            created += 1

        if len(auth_users) < per_page:
            break
        page += 1

    return created


def _seed_one_user(user: dict, force: bool) -> tuple[int, int, int]:
    sb = get_supabase()
    user_id = user["id"]
    gigs = user.get("gigs") or ["Content Creator"]
    tax_rate = float(user.get("estimated_marginal_tax_rate", 0.24))

    existing_tx = sb.table("transactions").select("id").eq("user_id", user_id).limit(1).execute().data or []
    if existing_tx and not force:
        return (0, 0, 0)

    tx_rows, deduction_rows, signal_rows = seed_demo_rows_for_user(user_id, gigs, tax_rate)

    sb.table("transactions").delete().eq("user_id", user_id).execute()
    sb.table("deductions").delete().eq("user_id", user_id).execute()
    sb.table("optimization_signals").delete().eq("user_id", user_id).execute()

    if tx_rows:
        sb.table("transactions").insert(tx_rows).execute()
    if deduction_rows:
        sb.table("deductions").insert(deduction_rows).execute()
    if signal_rows:
        sb.table("optimization_signals").insert(signal_rows).execute()

    return (len(tx_rows), len(deduction_rows), len(signal_rows))


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed demo transaction data into Supabase tables for existing users.")
    parser.add_argument("--force", action="store_true", help="Replace existing seeded/real rows for each user.")
    parser.add_argument("--user-id", help="Seed only one user id.")
    args = parser.parse_args()

    _load_env()

    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in backend/.env.")
        return 1

    sb = get_supabase()

    if args.user_id:
        users = sb.table("users").select("id,gigs,estimated_marginal_tax_rate").eq("id", args.user_id).execute().data or []
    else:
        users = sb.table("users").select("id,gigs,estimated_marginal_tax_rate").execute().data or []

    if not users:
        bootstrapped = _bootstrap_users_from_auth()
        if bootstrapped:
            print(f"Bootstrapped {bootstrapped} user profile(s) from Supabase Auth.")
            if args.user_id:
                users = sb.table("users").select("id,gigs,estimated_marginal_tax_rate").eq("id", args.user_id).execute().data or []
            else:
                users = sb.table("users").select("id,gigs,estimated_marginal_tax_rate").execute().data or []

    if not users:
        print("No users found to seed. Create/sign in a Supabase user first, then rerun.")
        return 0

    seeded_users = 0
    total_tx = 0
    total_ded = 0
    total_sig = 0

    for user in users:
        tx_count, ded_count, sig_count = _seed_one_user(user, args.force)
        if tx_count or ded_count or sig_count:
            seeded_users += 1
            total_tx += tx_count
            total_ded += ded_count
            total_sig += sig_count
            print(f"Seeded {user['id']}: {tx_count} transactions, {ded_count} deductions, {sig_count} signals")
        else:
            print(f"Skipped {user['id']}: existing transactions found (use --force to reseed)")

    print(
        f"Done. Users seeded: {seeded_users}/{len(users)} | transactions={total_tx}, deductions={total_ded}, signals={total_sig}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
