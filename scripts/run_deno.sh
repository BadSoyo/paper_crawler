set -a
source .env
set +a
deno run --allow-net --allow-env scripts/run_deno.ts
