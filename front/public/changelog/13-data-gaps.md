---
title: Data gaps & analysis
date: 2025-08-19
type: changelog
---

Now the bot **analyses the data gaps** whenever it gives out an answer for any question across the channels. It primarily checks two aspects

1. It checks how **densely the data is available** from knowledge base for the asked question.
2. It checks how **relavent the question** is for the knowledge base

Depending on the scores for above two features, it decides if there is any potentials data gap. If so, it *drafts* a note explaining the topic of the data gap and points to cover.

![Data gaps](/changelog-images/data-gaps-analysis.png)