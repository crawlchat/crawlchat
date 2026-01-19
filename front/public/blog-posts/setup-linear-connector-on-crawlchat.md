---
title: How to Set Up a Linear Connector on CrawlChat
date: 2025-10-01
description: Linear integration with CrawlChat centralizes project data, speeds up queries, and automates updates, helping GTM teams collaborate efficiently and focus on strategic work.
image: /blog-images/post/linear-crawlchat-connector.png
---

Integrating a Linear Connector with CrawlChat is a straightforward yet powerful way to streamline project management for your team. Connecting Linear with CrawlChat allows you to import issues and project updates directly into your knowledge base, enhancing accessibility and saving time. This guide will walk you through the steps to set up the Linear Connector to kickstart an integrated workflow that boosts your team's efficiency.

## Step 1: Create an API Key on Linear

To begin, you will need to create an API key in your Linear account, which is essential for enabling the integration with CrawlChat. Here’s how:

1. Log into your Linear account.
2. Navigate to the **Settings** of your workspace.
3. Click on **Security & Access**.
4. Under **Personal API Keys**, click on **New Token**.
5. Give your token a name (for example, "CrawlChat").
6. Select **Only select permissions** under **Permissions** and check the **Read** option.
7. Choose **All teams you have access to**.
8. Click on **Create** to generate the API key.
9. Copy the created API Key; you will need it for the next steps.

For additional details on setting up your API keys, refer to our documentation on [CrawlChat's API Key Setup](https://docs.crawlchat.app/knowledge-base/linear-issues).

## Step 2: Create a Group in CrawlChat

Once you have your API key, the next step is to create a group within CrawlChat to import your Linear issues:

1. Go to the [New Group](https://crawlchat.app/knowledge/group) page on CrawlChat.
2. Select **Linear** as the group type.
3. Fill in the form with the required information, including the API Key generated in the previous step.
4. After creating the group, enable the **Auto Update** feature to set the frequency of updates (daily or weekly) to keep your knowledge base current.

## Step 3: Configure Statuses to Skip (Optional)

To maintain a clean knowledge base, you can configure which statuses of issues and projects should be skipped. This allows you to fetch only relevant information into CrawlChat, ensuring that your team focuses on actionable updates.

## Step 4: Understand the Rate Limits

It’s important to be aware of the constraints related to the Linear API. Linear has a rate limit of **1500** requests per hour. To ensure that CrawlChat operates smoothly and does not breach this limit, keep in mind the following:

1. CrawlChat fetches a maximum of **250** issues and **250** projects per request.
2. These requests are sorted by the last updated date, ensuring you always have the latest 250 issues/projects.
3. Auto updates will keep your system refreshed, adding or updating existing data without removing older records.

## How Linear Integration Benefits GTM Teams as Internal Chat Assistants

For Go-To-Market (GTM) teams, the integration of Linear with CrawlChat serves as an invaluable internal chat assistant. It transforms how team members access project data and interact with one another, providing several advantages:

1. **Centralized Access to Information:** GTM teams manage a wide array of projects. The Linear Connector allows for comprehensive project details, such as summaries and descriptions, to be imported into CrawlChat. This centralization means team members can effortlessly find the most up-to-date information, fostering better collaboration.
2. **Effective Query Resolution:** With the Linear integration, internal assistants can swiftly retrieve information regarding projects and tasks through simple queries in CrawlChat. This efficiency improves inquiry response times, freeing up team members to focus on more strategic tasks rather than data searches.
3. **Focus on Strategic Initiatives:** The reduction in time spent on administrative tasks due to task automation allows GTM teams to concentrate on delivering value. By automating updates, teams can devote more resources to key initiatives that drive business growth.

## Conclusion

Setting up a Linear Connector with CrawlChat is a strategic step towards enhancing your project management capabilities. This integration not only aids in knowledge management but also acts as an internal chat assistant for GTM teams—facilitating communication and improving workflows.

With the setup completed, your team will experience immediate benefits, making vital project information available at their fingertips and significantly enhancing both collaboration and productivity. For further tips on optimizing your project management tools, be sure to check out our other blog posts on effective knowledge management systems, like [Why You Need to Integrate a Chatbot AI with Your Documentation](/blog/why-you-need-to-integrate-chatbot-ai-to-your-documentation), where we discuss how to enhance user interaction with documentation through AI.
