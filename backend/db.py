import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_ANON_KEY"]
        _client = create_client(url, key)
    return _client


# Supabase SQL to run in dashboard:
#
# create table expenses (
#   id uuid primary key default gen_random_uuid(),
#   user_id text not null,
#   source text not null,          -- 'plaid' | 'email' | 'venmo' | 'zelle' | 'manual'
#   merchant text not null,
#   amount numeric(10,2) not null,
#   date date not null,
#   category text default 'Other',
#   raw_text text,
#   confidence numeric(3,2),
#   created_at timestamptz default now()
# );
#
# create table category_rules (
#   id uuid primary key default gen_random_uuid(),
#   user_id text not null,
#   pattern text not null,         -- merchant substring to match (case-insensitive)
#   category text not null,
#   created_at timestamptz default now()
# );
