# Cloudflare Patterns

A collection of patterns for building on Cloudflare.

## Storage

- [memory-and-persist-durable-objects](./patterns/memory-and-persist-durable-objects) — Demonstrates how a Durable Object can hold ephemeral in-memory state for fast reads and rehydrate it from persistent storage when the DO restarts.

## Workflows

- [per-user-cron](./patterns/per-user-cron) — A Durable Object per user that fires alarms on a per-user schedule — useful for trial expirations, digest emails, and subscription reminders.
- [queue-claim-check](./patterns/queue-claim-check) — Send large payloads through Cloudflare Queues by stashing the body in R2 and passing only a reference (claim check) — keeps messages under the 128 KB queue limit.
