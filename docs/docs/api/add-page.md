---
sidebar_position: 4
---

# Add Page API

You can use this REST API to add content as Page to you Collections Knowledge Base. It will instantly get added and will be available for the answering engine across all the channels

### API Key

You need to pass an `API_KEY` to all the following requests. You can create an `API_KEY` from the [API Keys](https://crawlchat.app/api-key) page on your dashboard.

### URL

```
POST https://wings.crawlchat.app/page/{COLLECTION_ID}
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

| Key                          | Type     | Note                                                       |
| ---------------------------- | -------- | ---------------------------------------------------------- |
| `title` (required)           | `STRING` | The title of the page                                      |
| `content` (required)         | `STRING` | The text content of the page                               |
| `knowledgeGroupId (required) | `STRING` | The knowledge group ID to which this page should get added |

### CURL Request

```bash
curl --location --request POST 'https://wings.crawlchat.app/page/YOUR_COLLECTION_ID' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "content": "From api",
    "title": "The text content of the new page",
    "knowledgeGroupId": "68fe1254773f2997d672c343"
}'
```

### Response

You get the answer from the LLMs along with source pages information. Following is a sample response

```json
{
  "scrapeItem": {
    "metaTags": [],
    "embeddings": [
      {
        "id": "67d29ce750df5f4d86e1db33/c1a791f2-b371-424f-98dc-3ee5554a2197"
      }
    ],
    "id": "68fe1130cf9ce8a3c8911f6f",
    "scrapeId": "67d29ce750df5f4d86e1db33",
    "userId": "68dcdb06f1336a523386e07a",
    "knowledgeGroupId": "68fe1106cf9ce8a3c8911f6d",
    "url": null,
    "title": "From api",
    "markdown": "From api",
    "status": "completed",
    "error": null,
    "createdAt": "2025-10-26T12:16:48.077Z",
    "updatedAt": "2025-10-26T12:16:50.414Z"
  }
}
```
