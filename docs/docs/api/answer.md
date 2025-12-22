---
sidebar_position: 1
---

# Answer API

You can use this REST API to send a query and get the answer just like you do on the chat widget. Use this to integrate it with your own application or workflows to build complex solutions. You can see the queries asked on the [Messages](https://crawlchat.app/messages) page with channel as `API`.

### API Key

You need to pass an `API_KEY` to all the following requests. You can create an `API_KEY` from the [API Keys](https://crawlchat.app/api-key) page on your dashboard.

### URL

```
POST https://wings.crawlchat.app/answer/{COLLECTION_ID}
```

You can find the `COLLECTION_ID` from the [Settings](https://crawlchat.app/settings) page on your dashboard. Paste it in the above URL

### Headers

You need to pass the following headers in the request

| Key            | Value              | Note                                                    |
| -------------- | ------------------ | ------------------------------------------------------- |
| `x-api-key`    | `{API_KEY}`        | Use the `API_KEY` that you generated from the dashboard |
| `content-type` | `application/json` | The request should send the body as `JSON`              |

### Body

Pass the following information in the body of the request

| Key                    | Type     | Note                                                                 |
| ---------------------- | -------- | -------------------------------------------------------------------- |
| `query` (required)     | `STRING` | The query or the question you want to ask                            |
| `prompt` (optional)    | `STRING` | You can pass a custom prompt for the LLMs for this particular query  |
| `clientUserId` (optional) | `STRING` | A unique identifier for the client user. This will be used as the fingerprint when saving messages |

### CURL Request

```bash
curl --location --request POST 'https://wings.crawlchat.app/answer/YOUR_COLLECTION_ID' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "query": "How to setup the Discord bot?",
    "prompt": "Keep it as short as possible",
    "clientUserId": "user-123"
}'
```

### Response

You get the answer from the LLMs along with source pages information. Following is a sample response

```json
{
  "content": "To set up a Discord bot, you need to add it to your Discord server. Once installed, you can tag the bot with `@crawlchat` to ask questions, and it will provide answers based on your documentation. Additionally, you can make the bot learn new information by tagging it with `@crawlchat learn`, allowing it to improve its responses over time . \n\nFor more functionalities, you can configure specific settings in the Discord settings page on your dashboard, such as which channels the bot should listen to, ensuring it replies only in designated channels for a clutter-free experience .",
  "message": {
    "links": [
      {
        "url": "https://crawlchat.app/changelog/15-discord-reply-thread-channel-names",
        "title": "Set channel names and reply as thread for Discord",
        "score": 0.9904406,
        "scrapeItemId": "68de58a8029458e0a489d2d6",
        "knowledgeGroupId": "68de5854f1336a523386e07c",
        "fetchUniqueId": "03309",
        "searchQuery": "setup Discord bot"
      },
      {
        "url": "https://crawlchat.app/discord-bot",
        "title": "Discord bot - CrawlChat",
        "score": 0.95961094,
        "scrapeItemId": "68de5871029458e0a489d2c3",
        "knowledgeGroupId": "68de5854f1336a523386e07c",
        "fetchUniqueId": "08370",
        "searchQuery": "setup Discord bot"
      },
      {
        "url": "https://crawlchat.app/blog/how-discord-bot-helps",
        "title": "How Discord Bot helps?",
        "score": 0.95447797,
        "scrapeItemId": "68de5886029458e0a489d2cb",
        "knowledgeGroupId": "68de5854f1336a523386e07c",
        "fetchUniqueId": "11882",
        "searchQuery": "setup Discord bot"
      },
      {
        "url": "https://crawlchat.app/changelog/17-image-attachments-on-discord",
        "title": "Image attachments on Discord",
        "score": 0.83141696,
        "scrapeItemId": "68de58a4029458e0a489d2d4",
        "knowledgeGroupId": "68de5854f1336a523386e07c",
        "fetchUniqueId": "54050",
        "searchQuery": "setup Discord bot"
      }
    ],
    "ticketMessage": null,
    "apiActionCalls": [],
    "analysis": null,
    "id": "68e7afd6379054e45a88ae5d",
    "threadId": "683affa84c1cb69dcc5b2164",
    "ownerUserId": "6790c3cc84f4e51db33779c5",
    "scrapeId": "67d29ce750df5f4d86e1db33",
    "questionId": null,
    "llmMessage": {
      "role": "assistant",
      "content": "To set up a Discord bot, you need to add it to your Discord server. Once installed, you can tag the bot with `@crawlchat` to ask questions, and it will provide answers based on your documentation. Additionally, you can make the bot learn new information by tagging it with `@crawlchat learn`, allowing it to improve its responses over time !!11882!!. \n\nFor more functionalities, you can configure specific settings in the Discord settings page on your dashboard, such as which channels the bot should listen to, ensuring it replies only in designated channels for a clutter-free experience !!03309!!."
    },
    "pinnedAt": null,
    "channel": "api",
    "rating": null,
    "correctionItemId": null,
    "slackMessageId": null,
    "discordMessageId": null,
    "createdAt": "2025-10-09T12:51:34.340Z",
    "updatedAt": "2025-10-09T12:51:34.340Z"
  }
}
```
