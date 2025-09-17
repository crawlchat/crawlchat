---
sidebar_position: 1
---

# Embed on web

The most common way to put the bot in use is to embed it on your documentation website. This is a very straight forward adding `<script/>` tag on your `html` page.

:::note
Framework specific embed instructions are coming soon!
:::

You can go to Connect > [Embed](https://crawlchat.app/connect/embed) page to find more information.

## HTML

Copy the following code and past in the `<head>` section of your page. Replace value of `data-id` to your collection id. You can find it on [Settings](https://crawlchat.app/settings) page.

```html
<script 
  src="https://crawlchat.app/embed.js" 
  id="crawlchat-script" 
  data-id="YOUR_COLLECTION_ID" <!-- Ex: 67d29ce750df5f4d86e1db33 --!>
></script>
```

## Docusaurus

If you are running a Docusaurus website (just like this one), add the following code to your `docusaurus.config.ts` file. Replace value of `data-id` to your collection id. You can find it on [Settings](https://crawlchat.app/settings) page.

```js
headTags: [
  {
      "tagName": "script",
      "attributes": {
        "src": "https://crawlchat.app/embed.js",
        "id": "crawlchat-script",
        "data-id": "YOUR_COLLECTION_ID"
      },
    },
],
```

## Options

- `data-hide-ask-ai` set it to `true` to hide the **Ask AI** button