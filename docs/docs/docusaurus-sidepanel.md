---
sidebar_position: 8
---

# Docusaurus sidepanel

Now you can embed the Ask AI widget as sidepanel instead of as a popup. This pattern has been adopted by many documentations. It has few advantages over the traditional popup.

- Non blocking experiance. Users can browse the docs and also Ask AI on side
- Quick Source Link navigation
- Shortcut to open and close
- Better experiance

![Docusaurus Sidepanel](./images/docusaurus-sidepanel.png)

You can embed it as side panel under few minutes on your Docusaurus based website. Following the procedure as mentioned below.

## Embed

First step is to embed the chatbot as you usually do and pass two attributes in addition that makes the chatbot to be embedded as side panel.

```json
headTags: [
  {
      "tagName": "script",
      "attributes": {
        "src": "https://crawlchat.app/embed.js",
        "id": "crawlchat-script",
        "data-id": "YOUR_COLLECTION_ID",
        "data-sidepanel": "true", // makes it sidepanel
        "data-hide-toc": "true", // optional, hides the TOC when sidepanel is open
      },
    },
],
```

## Add custom Ask AI button

It is a common practice to have a button on the nav bar that opens and closes the side panel. Better to call it Ask AI so that the users know that they can ask the AI. Copy the following code

```json title="docusaurus.config.ts"
themeConfig: {
    navgar: {
        items: [
            {
                type: 'html',
                position: 'right',
                value: `<button
                class="crawlchat-nav-askai"
                onclick="window.crawlchatEmbed.toggleSidePanel()">
                    Ask AI
                    <span class="keyboard-keys">
                    <kbd>⌘</kbd>
                    <kbd>I</kbd>
                    </span>
                </button>`,
            },
        ]
    }
}
```

Add the following styles for the above Ask AI button. Feel free to change it as per your like

```css title="css/custom.css"
.theme-back-to-top-button {
  display: none; // hides the back to top button. Blocks the view
}

.crawlchat-nav-askai {
  background-color: var(--ifm-color-emphasis-100);
  border: none;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid var(--ifm-color-emphasis-200);

  @media (max-width: 768px) {
    display: none;
  }
}

.crawlchat-nav-askai:hover {
  background-color: var(--ifm-color-emphasis-200);
}

.crawlchat-nav-askai .keyboard-keys {
  margin-left: 8px;
}
```

## crawlchat-client

You need to install the `crawlchat-client` npm package on your Docusaurus project and use the `useCrawlChatSidePanel` hook on your `Layout/index.tsx` file so that it handles client side navigation, dark theme sync, resizing, and makes it a regular Ask AI Popup on mobile devices.

```bash
npm install crawlchat-client
```

```tsx title="theme/Layout/index.tsx"
import React, { useEffect, type ReactNode } from "react";
import Layout from "@theme-original/Layout";
import { useHistory } from "@docusaurus/router";
import { useCrawlChatSidePanel, CrawlChatScript } from "crawlchat-client";

export default function LayoutWrapper(props) {
  useCrawlChatSidePanel({ history: useHistory() });

  return (
    <>
      <Layout {...props} />
    </>
  );
}
```

Also, users can use `Cmd` `I` shortcut to open the side panel for quick usage.
