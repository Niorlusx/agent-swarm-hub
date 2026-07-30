# Ollama Integration Guide

## Overview

This guide covers integrating **Ollama** as a local LLM backend for the `Orchestrate_TaskOrchestrator` and the broader agent-swarm-hub.

Ollama allows running open-source models (Llama 3.1, Mistral, Phi-3, Gemma, etc.) locally with a simple OpenAI-compatible API.

## Prerequisites

- Docker & Docker Compose
- NVIDIA GPU recommended (CPU works but slower)
- At least 16 GB RAM for 7B–8B models, 32 GB+ for larger models

## Quick Start with Docker Compose

```bash
docker compose up -d
```

This starts:
- `ollama` service on port 11434
- The orchestrator (when configured)

## Pulling Models

```bash
# Inside the ollama container or via CLI
ollama pull llama3.1
ollama pull mistral
ollama pull phi3
ollama pull nomic-embed-text   # for embeddings
```

List models:
```bash
ollama list
```

## Configuration

Set these environment variables:

```bash
OLLAMA_HOST=http://ollama:11434          # or http://localhost:11434
OLLAMA_MODEL=llama3.1                    # default model
OLLAMA_EMBED_MODEL=nomic-embed-text
```

## Using Ollama in OpportunityTranslator

Replace or augment the LLM client:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # required but unused
)

response = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Decompose this opportunity into tasks..."}],
    temperature=0.2,
)
```

## Health Check

```bash
curl http://localhost:11434/api/tags
```

## Model Registry (CI)

See `.github/workflows/model-registry.yml` for automated model pulling and caching.

## Fallback Strategy

If Ollama is unreachable, the orchestrator should fall back to:
1. xAI Grok
2. OpenAI GPT-4o
3. Cached / rule-based decomposition

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Connection refused | Ensure `ollama` service is healthy |
| Out of memory | Use smaller model or increase Docker memory |
| Slow responses | Enable GPU passthrough in docker-compose |
| Model not found | Run `ollama pull <model>` |

## Related Issue

https://github.com/Niorlusx/agent-swarm-hub/issues/10
