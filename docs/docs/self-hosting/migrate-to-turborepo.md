---
sidebar_position: 5
---

# Migrate to Turborepo

This is applicable to those who cloned the repo before 26th January 2026. The repository is migrated to [Turborepo](https://turborepo.dev) on 25th January 2026. Here are the steps to change the local development workfow that works with this change.

Checkout how to run [locally](./run-locally.md) if you are setting it up fresh.

1. `git pull origin main`
2. `cp .env.example .env` from repo root
3. Copy all individual `.env` values to root `.env`
4. `npm i` from repo root
5. `npm run dev` from repo root

### Cleanup

1. Remove all `.env` files from the individual services
