# Cloudflare Patterns

A collection of patterns for building on Cloudflare.

## AI

- [ai-game-generator](./patterns/ai-game-generator) — AI generated game with its own worker and dynamic state
- [infinite-procedural-dungeon](./patterns/infinite-procedural-dungeon) — Dynamic room behaviour with per-user Durable Object facet state and trusted inventory supervisors

## Storage

- [memory-and-persist-durable-objects](./patterns/memory-and-persist-durable-objects) — Demonstrates how a Durable Object can hold ephemeral in-memory state for fast reads and rehydrate it from persistent storage when the DO restarts.

## Workflows

- [per-user-cron](./patterns/per-user-cron) — A Durable Object per user that fires alarms on a per-user schedule — useful for trial expirations, digest emails, and subscription reminders.
