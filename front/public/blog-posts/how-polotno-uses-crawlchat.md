---
title: How Polotno uses CrawlChat to power AI Support and improve developer experience
date: 2025-06-19
description: Polotno uses CrawlChat to power an AI assistant that helps developers instantly find answers from documentation, boosting productivity and support.
---

This is an excerpt from Anton's [tweet](https://x.com/lavrton/status/1935413416497156109)

Anton from the Polotno team recently shared how they’re using AI to dramatically improve the developer experience.

About a month ago, Polotno migrated its discussions and support from Discord to a dedicated community platform. The motivation? To make Q\&A content *indexable, searchable,* and most importantly, *usable by AI agents*.

In this post, we’ll walk through how they integrated [CrawlChat](https://crawlchat.app), the benefits it brings to developers, and how you can set up your workflow to leverage AI while working with the [Polotno](https://polotno.com) SDK.

---

## Why Polotno Moved to a Community Platform

Support in Discord was real-time but fleeting. With a community platform, there's now a growing repository of structured information that both humans and AI can access.

This laid the groundwork for their next step: integrating an AI tool that interacts with the knowledge base.

---

## CrawlChat + Polotno = Instant AI Answers

Polotno integrated the [CrawlChat Tool](https://crawlchat.app), which made a significant difference:

> "CrawlChat Tool learns your documentation and it gives you the AI agent that answers your question based on the knowledge that you provide to them."

You can now ask the embedded AI widget questions like:

*"How to change the size of the page?"*

CrawlChat will:

* Search the documentation
* Pull up relevant examples
* Provide links to the right sections

This makes it a super-efficient way to find answers without digging through pages.

And it keeps improving:

> "The more questions you ask in the community... we review them, we answer them. So it builds the large knowledge base that can be used like CrawlChat and over to find documentation much faster and quicker."

---

## AI-Powered Development in Cursor with MCP Server

Polotno takes developer experience even further by combining **Cursor IDE** and **MCP Server**, a local tool that brings documentation right into your coding environment.

Here’s how Anton set it up:

1. Created a blank React + TypeScript app using Vite.
2. Opened Cursor, went to MCP Settings, and added a new server pointing to the Polotno documentation.

Then, he asked:

*"Remove current component content and show Polotno editor instead."*

Cursor parsed the request, searched the documentation, and returned helpful guidance. It created a custom side panel, rendered transform controls, and made the editor responsive to selections. Even when things weren’t perfect the first time, the loop was fast and iterative.

The UI may not have been pretty right away—but it worked. And the AI could keep refining it.

---

## Best Practices from the Polotno Team

Anton recommends a few things to get the most out of this workflow:

### ✅ 1. Join the Polotno Community

Start asking questions and reading past discussions. Your questions help others—and train the AI.

### 🤖 2. Use the AI Tool

Ask questions using the embedded AI widget powered by CrawlChat. Get instant help and working examples.

### 🛠️ 3. Set Up Polotno Docs in Cursor

Configure MCP Server with Polotno documentation in Cursor IDE so AI can assist you directly in your editor.

> "AI agent can use documentation to find answers for your questions and help you resolve your requirements much quicker."

---

## Final Thoughts

With a rich community platform, CrawlChat’s AI-powered documentation engine, and in-editor help via MCP and Cursor, [Polotno](https://polotno.com) is creating one of the most AI-enhanced SDK experiences available today.

— Written based on insights shared by Anton from the Polotno team
