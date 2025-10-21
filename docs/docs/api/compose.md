---
sidebar_position: 3
---

# Compose API

You can use this REST API to compose text content from your knowledge base. This is different from `/answer` because you can keep asking updates on the created content iteratively. It fetches the context from the knowledge base of the collection and makes up the content automatically.

### API Key

You need to pass an `API_KEY` to all the following requests. You can create an `API_KEY` from the [API Keys](https://crawlchat.app/api-key) page on your dashboard.

### URL

```
POST https://wings.crawlchat.app/compose/{COLLECTION_ID}
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

| Key                     | Type     | Note                                                                                                                                                                                                                            |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt` (required)     | `STRING` | The input prompt for the content creation or updation                                                                                                                                                                           |
| `messages` (optional)   | `STRING` | Pass back the previous messages returned by the API in response. Make sure it is `JSON` string. Default is `"[]"`                                                                                                               |
| `formatText` (required) | `STRING` | A descriptive summary of the text format                                                                                                                                                                                        |
| `llmModel` (optional)   | `ENUM`   | The LLM model to use. Should be one of `gpt_4o_mini`, `o3_mini`, `sonnet_3_7`, `sonnet_3_5`, `gemini_2_5_flash`, `gemini_2_5_flash_lite`, `o4_mini`, `gpt_5_nano`, `gpt_5_mini`, `gpt_5`, `sonnet_4_5`. Default is `sonnet_4_5` |

It consumes message credits as per the AI model.

### CURL Request

```bash
curl --location --request POST 'https://wings.crawlchat.app/compose/YOUR_COLLECTION_ID' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "prompt": "Write a short summary about pricing plans",
    "format": "email",
    "formatText": "Keep it simple text that works well as an email body"
}'
```

```bash
curl --location --request POST 'https://wings.crawlchat.app/compose/YOUR_COLLECTION_ID' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "prompt": "Also add about the purchase links",
    "messages": "[...]"
    "format": "email",
    "formatText": "Keep it simple text that works well as an email body"
}'
```

### Response

You get the content and the messages that you can pass in subsequent API requests so that it follows as thread

```json
{
  "content": "Here are the pricing plans ...",
  "message": [{...}, ...]
}
```
