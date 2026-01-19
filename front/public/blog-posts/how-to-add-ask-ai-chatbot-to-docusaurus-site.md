---
title: How to add Ask AI Chatbot to Docusaurus site
date: 2025-05-01
description: Add an AI-powered “Ask” button to your Docusaurus docs for instant, smart user support.
image: /blog-images/post/add-ask-ai-to-docusaurus.png
---

If you're using [Docusaurus](https://docusaurus.io/) for your documentation, there’s a really smart and easy way to level up the experience for your readers — by adding an AI-powered chatbot with [CrawlChat](https://crawlchat.app/).

In just a few minutes, you can let your users _ask questions_ directly on your docs site and get instant answers, powered by your own content. Sounds cool? Let’s walk through how to do it step-by-step.

---

## Step 1: Add Your Docs as a Knowledge Base

Before the bot can answer questions, it needs to _know_ your documentation. Here's how to make that happen:

![Docusaurs based knowledge group](/blog-images/docusaurus-based-group.png)

1. Head to your CrawlChat dashboard and either pick a collection or create a new one.
2. Go to the **Knowledge** tab and click **Add Group**.
3. From the list of sources, choose **Docusaurus based**.
4. Paste in the URL of your Docusaurus docs (example: `https://yoursite.com/docs`).
5. Give the group a name like “Docs” and exclude any older versions if needed (e.g., `2.x`).
6. Click **Create** – CrawlChat will now understand that it needs to pull and learn from these docs.
7. Click the **refresh** button to start fetching content.
8. You’ll see the pages being processed under **Knowledge items**.

---

## Step 2: Embed the “Ask AI” Chatbot

Now that CrawlChat knows your content, it’s time to let users interact with it on your website.

![Docusaurs based knowledge group](/blog-images/docusaurus-embed-config.png)

1. Go to the **Integrations** section in your CrawlChat dashboard.
2. Under the **Embed** tab, customize how the “Ask AI” button should look – color, position, text, and so on.
3. Then go to the **Docusaurus** tab to get the exact code snippet.
4. Click **Copy** and open your project’s `docusaurus.config.js` file.
5. Paste the config at the top level of the file and save it.
6. Restart your local dev server (or redeploy if on production).
7. Visit your docs page – the **Ask AI** button should now be visible and working.

---

## That’s It

With these quick steps, your Docusaurus site now has an interactive chatbot that actually knows your documentation. Whether it's a developer looking for quick answers or a customer navigating your docs, they can get help instantly without scrolling endlessly.

If you haven’t tried [CrawlChat](https://crawlchat.app) yet — go check it out. It’s a game-changer for support, onboarding, and making your docs way more helpful.

Go [here](https://guides.crawlchat.app/walkthrough/680faa4af1418d1ba47042ca/read) for a detailed guide on setting it up.
