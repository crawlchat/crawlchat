---
sidebar_position: 2
---

# Web

The most popolar way of adding your documentation to CrawlChat is by providing your docs site URL for **Web** group type and it fetches them automatically. Anyways, you can provide multiple options to get full control over what goes into the knowledge base from the scraping content.

Navigate to the group page to configure the following settings

## HTML tags to remove

You can remove few sections from the content such as nav bar, side menu, footer, etc. You can provide the CSS selectors for such elements and they will be removed from the content.

Remember, junk in, junk out. So, it is important to keep the content very clean and appropriate

## Skip pages

You can configure the paths to ignore from the scrape process. Example, _/admin_, _/dashboard_ so that those pages and sub pages will be ignored.

## Auto update

You can configure an auto update frequency for the knowledge group. This makes sure that the knowledge base is up to date with your docs and in sync.

## Item context

In some cases, where there are multiple versions of the docs, it is required to mention the version detail in every page. You can pass any text as context and that will be inserted in every page so that the AI doesn't get confused between versions (in this example).
