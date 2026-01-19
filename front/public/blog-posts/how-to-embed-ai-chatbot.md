---
title: How to add AI Chatbot for your docs
date: 2025-04-22
description: Learn how to add chatbot for your docs on your website and other channels
image: /blog-images/post/embed-ai-chatbot.png
---

We are currently living in a generation where embedding **AI** into our daily workflows is absolute mandatory. **AI** and **LLM**s are changing the way we do our day to day activities. This includes how people access and consume your documents and contents.

Those were the days where we go through multiple links just to realize that the required answers are hindered under so many pages and paragraphs. **OpenAI** really changed this entire workflow. People are adopting the natural way of talking with systems to find the help the need.

This makes all the content houses and docs hosting websites to integrate with **AI** so that the community can talk with the docs and content. In other words, it is absolutely important to turn the docs into **AI** and **LLM** ready!

Let us see how embed Chatbot that can learn information from your own docs so that it knows everything about your docs and answers community questions with high accuracy and less hallucination.

## Pick the right tool

There are multiple tools available that makes use of **RAG** (Retrieval Augmented Generation) to make the generic **LLM**s contextful about your own docs. [CrawlChat](https://crawlchat.app) is the simpler and most affordable among others like [Kapa.ai](https://kapa.ai) & [Inkeep](https://inkeep.com). **CrawlChat** provides all the tools to turn your docs and content into LLM ready with ease. Here are few useful tools available on CrawlChat

- Turn any web docs into knowledge
- Add Github codebase & Github issues, etc. as codebase
- Integrate Chat widget
- Discord & Slack bots
- MCP server for your docs
- Analytics and observability

We consider CrawlChat for the demonstration purpose for this post and the process goes as discussed below.

## 1. Add knowledge base

Once you signup on [CrawlChat](https://crawlchat.app) you get to create different **collections** for different projects. Create one for your docs. Once you have a collection, you can create different **knowledge groups** for different sources. For example, let's say you have sources such as

- Docs for the library hosted on a URL - [Docusaurus](https://docusaurus.io) or [GitBook](https://www.gitbook.com) and more
- The Github issues
- A [Discord](https://discord.com) server threads

![Knowledge groups](/blog-images/how-add-chatbot/knowledge-groups.png)

You can create different groups for each of this. Let's see how we add the _docs_ and the _Github issues_ as the knowledge base

### Docs as knowledge group

It is quite easy to add the existing docs as knowledge base. It goes as follows

1. Click **New group**
2. Select **Web**
3. Give the URL for the docs. Ex: https://remotion.dev/docs
4. Click **Save**

This creates the knowledge group for the docs. You can go to **Knowledge** > **Group** to configure more settings. For example

- You can configure the HTML tags to remove. It is recommended to remove nav bar, footer, side menu etc. for better quality
- You can configure it to skip few pages. Example, you don't want to to include **/admin** related pages

![Web Knowledg group](/blog-images/how-add-chatbot/web-knowledge-group.png)

Once you configure it the way you want, you can hit **Refresh** on top right section to start the scraping process. It takes few minutes depending on the number of pages exist on your docs. You can go to **Knowledge Items** tab to see all the pages being scraped and added as the knowledge inside the collection.

### Github Issues as knowledge group

The flow is pretty similar to the _Docs_ mentioned above,

1. Go ahead and hit **New grop** button
2. This time, select **Github issues** option
3. Give it a name
4. Give the URL of the **Github repository**. Example, https://github.com/remotion-dev/remotion

Once the group is created, hit the **Refresh** button to start the fetching process. You can also see the issues being fetched from **Knowledge items** tab.

![Github issues Knowledge group](/blog-images/how-add-chatbot/github-issues-knowledge-group.png)

There are other sources you can use to add more sources to the collection. [CrawlChat](https://crawlchat.app) is continuously adding more source options to quickly import your docs and content.

## 2. Integrate

Awesome, you have already setup your sources for the **LLM**s to use them as context and answer the community questions. It is time to integrate the **chatbots** into your workflow. There are multiple ways you can integrate them into your setup. Let us consider you have following workflow

- The docs website where you community visits to find help
- A Discord channel where they ask questions and experts answer them

**CrawlChat** can integrate with both of the above platforms!

### Embed Chat widget

The first and very basic way of bringing the **AI** chatbot is to integrate it on your docs website. It is as simple as inserting a `<script>` tag on your website. Go to **Integrations** > **Embed** section to customise the chat widget with your own brand color, text and other stylings. Copy the `code` showed and paste in the `<head>` section of your page.

![CrawlChat Ask AI Widget](/blog-images/how-add-chatbot/ask-ai-widget.png)

That's it! It adds the **Ask AI** button on your docs website. Your community can hit it and get all the help required, in any language! It gives all the source links so that they can find more help if required.

### Add Discord bot

Another very important integration is adding the **Discord Chat bot** to the _Discord server_. Mostly Discord is a place where the makers and maintainers spend significant of their time in answering the community questions. **CrawlChat Discord bot** helps the maintainers to save a lot of time by automating the help.

![CrawlChat Discord bot integration](/blog-images/how-add-chatbot/discord-bot-integration.png)

Your community members can now just `@crawlchat` tag and ask any question and the bot answers it just like it does on the Chat widget. Along with getting answers from the bot, you can make the bot to learn from the conversations. You can tag `@crawlchat` and say `learn` and it will add the entire conversation (replies and the thread) as _knowledge group_ on the collection and then it will be used to answer and subsequent questions.

You can also use the **MCP server** for the docs so that the community gets help right from their favorite **AI** apps such as **Cursor**, **Windsurf**, or **Claude**.

## 3. Analyse

You have done everything required to _deliver your docs with AI_. It is time to moniter how the AI is performing in answering the questions. **CrawlChat** comes with a good amount of tools to monitor the performance. Using these analytics and charts, you can find how to fine tune your docs or the prompts that matches the community.

![Analytics on CrawlChat](/blog-images/how-add-chatbot/analytics.png)

### Scoring the answers

**CrawlChat** gives a rating from **0 to 1** for every answer it provides and also for every knowledge source it uses to answer a particular question. Any answer having **1** represents that it had very relavent sources to answer the questions and vice verse. CrawlChat uses this score to show how well or bad the AI is performing in terms of answering the questions

### Conversations

You can view all the conversations your community is having from the **Conversations** page. CrawlChat shows the scores for the entire conversation and also for individual answers. This provides high level view of how people are using the AI and how it is answering the questions.

![Conversations on CrawlChat](/blog-images/how-add-chatbot/conversations.png)

### Score distribution

Go to the homepage of the collection to find the _Score distribution_ chart. This chart shows how the answer scores are distribution across the scale of 0 to 1. It generally looks like an inverted **U** curve. The more it towards **1** the better the knowledge base is in terms of answering the community questions.

![CrawlChat score ditribution analysis](/blog-images/how-add-chatbot/score-distribution.png)

You can find the threads with low rating, example **< 0.3** and see if the knowledge base has any data gaps. If the questions are legit and the answers are poor, that strongly means there is a **data gap** in the knowledge base and need to fill it with new additional docs.

### Group density

CrawlChat also shows how much each **knowledge group** is being referenced for answering the questions. This gives information about knowledge migration. For example, if you see, _Github issues_ group is using **40%** of the questions, maybe it is a good time to move some of them to docs as lot of people are asking about them.

![CrawlChat knowledge group density](/blog-images/how-add-chatbot/knowledge-group-density.png)

## Summary

Making your docs **LLM ready** is essential in the current **AI** driven world. It is important to find better tools to do this job and [CrawlChat](https://crawlchat.app) stands out with its offering. You have to add your sources such as **docs** and **Github issues** as knowledge groups into your collection and then **integrate** the **chatbot** into your workflow. Integrate **Ask AI** chatbot on your website, add the **Discord bot** to your channel and other appropriate integrations. Monitor the **AI** performance by the reports and charts it provides to fine tune the docs.
