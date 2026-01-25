---
sidebar_position: 4
---

# Notion pages

It is very common these days to have high level design documentation, compliance related information, policies, terms on Notion for internal usage. You can add those Notion pages to the bot with just few clicks.

![Notion group](./images/notion-group.png)

## Internal integration key

You need to create an Internal integration key on Notion dashboard and enter it on CrawlChat's new group page. This key provides CrawlChat application access to read the desired pages. This is how you can create it

1. Go to [Notion profile page](https://notion.so/profile)
2. Go to [Integrations](https://www.notion.so/profile/integrations)
3. Click **New integration**
4. Give an Integration Name, example CrawlChat Access
5. Select your workspace
6. Select Type as **Internal**
7. Hit Save
8. Now open the created Integration
9. Make sure _Read content_ and _Read comments_ is checked
10. Go to **Access** tab
11. Select the pages to which CrawlChat should have access to
12. Go to **Configuration** tab
13. Show the **Internal Integration Secret**
14. Copy it
15. Paste it on the CrawlChat's new group page

## Configuration

Once you create the group, you can configure the **Auto update frequency** so that it keeps in sync with the source all the time.

You can also configure the pages to skip if some pages are not relevant for the knowledge base.

Hit Fetch now to finally fetch the contents of the configured Notion pages.
