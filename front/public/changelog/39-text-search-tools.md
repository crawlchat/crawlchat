---
title: Text search tools for the AI
date: 2026-02-07
type: changelog
tags: focus
---

The answer flow now includes **text search tools** as a fallback when semantic search does not return enough. These tools help the AI find **nuanced details** and are **better suited for code** and precise references.

**Semantic search** matches by meaning and context—great for conceptual questions but it can miss exact wording, API names, or code patterns. **Phrase search** looks for a literal phrase and returns scored snippets. **Regex search** matches using a regular expression so the AI can target specific patterns: function or method names, URL shapes (e.g. `presigned.*URL`), code snippets, or exact syntax that semantic search would not reliably hit.

Regex matches are pattern-based and precise—they either match or they do not—so the AI can narrow in on exact strings, variable names, and code structures that matter for technical answers. Together with semantic search, the AI can first find the right area with meaning-based search, then use phrase or regex search to pull out the precise detail needed for code or API usage.

![Text search: Semantic and Regex](/changelog-images/text-search-regex.png)
