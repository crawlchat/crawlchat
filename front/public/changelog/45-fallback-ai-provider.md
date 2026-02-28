---
title: Fallback AI Provider
date: 2026-02-28
type: changelog
tags: focus
---

When your configured AI provider (OpenRouter) fails or times out, CrawlChat now automatically falls back to OpenAI's gpt-4o-mini. It ensures you still get an answer during provider outages, rate limits, or transient errors.
