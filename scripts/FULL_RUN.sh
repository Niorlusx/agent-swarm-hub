#!/usr/bin/env bash
# KeyForAgents + Notion.locker + .technology — FULL RUN 10×
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "KFA FULL RUN — keyforagents.com | keyforagents.technology | notion.locker"
export OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
export PREFER_LOCAL_LLM=true
if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi
echo "[…] Launching impact-first swarm"
# Drop the TypeScript orchestrator here or call python simulation
python3 -c "
import json, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
AGENTS=[('Revenue Swarm',0.92,45),('Audit Engine',0.88,38),('Vault Access',0.85,22),('SEO',0.78,31),('Enquiry Router',0.90,28),('GSYSTEM Meta',0.95,55)]
def run(n,i,l):
  time.sleep(l/1000); return {'agent':n,'ms':l,'impact':i}
start=time.perf_counter()
with ThreadPoolExecutor(6) as ex:
  futs=[ex.submit(run,*a) for a in AGENTS]
  for f in as_completed(futs):
    r=f.result(); print(f\"  ✓ {r['agent']:<20} {r['ms']}ms impact={r['impact']}\")
print(f'Total: {int((time.perf_counter()-start)*1000)}ms')
" 
