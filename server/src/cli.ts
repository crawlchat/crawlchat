import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";
import { getLimiter, wait } from "./rate-limiter";
import {
  getIssue,
  getIssues,
  getJustIssues,
  GithubPagination,
} from "./github-api";
import { SimpleAgent } from "./llm/agentic";
import { handleStream } from "./llm/stream";
import { getConfig } from "./llm/config";
import { loopFlowCli } from "./llm/flow-cli";
import { Flow } from "./llm/flow";
import { z } from "zod";
import { makeRagTool } from "./llm/flow-jasmine";

async function main() {
  const ragTool = makeRagTool("67c1d700cb1ec09c237bab8a", "mars").make();
  const config = getConfig("gemini_2_5_flash");
  // const config = getConfig("gpt_4o_mini");

  const planner = new SimpleAgent({
    id: "planner",
    prompt: `
🔍 Planner Agent Prompt for RAG (Keyword-Focused)

You are a planner agent in a Retrieval-Augmented Generation (RAG) system.

You need to break down the question into smaller atomic questions.
The sub quesion should be part of the main question. It cannot be a new question.

Example: How to do a & b?
Queries: 1. how to do a, 2. how to do b

Example: What is the difference between a and b?
Queries: 1. what is a, 2. what is b

Example: Compare a and b
Queries: 1. what is a, 2. what is b

Example: What are common features of a and b?
Queries: 1. features of a, 2. features of b
`,
    tools: [],
    schema: z.object({
      queries: z.array(z.string()),
    }),
    ...config,
  });

  const retriever = new SimpleAgent({
    id: "retriever",
    prompt: `
You are a retriever agent in a Retrieval-Augmented Generation (RAG) system.
Search about above mentioned query using the rag tool.
    `,
    tools: [ragTool],
    ...config,
  });

  const factChecker = new SimpleAgent({
    id: "factChecker",
    prompt: `
You are a fact checker agent in a Retrieval-Augmented Generation (RAG) system.
Check if the information is correct and relevant to the user's query.
You should check every single point mentioned in the answer and check it against the context if it is mentioned as used in the answer.
Consider the user intent and the answer and find if the answer is correct or not.
Wording is very important. You cannot cherry pick information.

    `,
    tools: [ragTool],
    schema: z.object({
      incorrectPoints: z.array(
        z.object({
          point: z.string(),
          correctAnswer: z.string(),
        })
      ),
    }),
    ...config,
  });

  const summarizer = new SimpleAgent({
    id: "summarizer",
    prompt: `
You are a summarizer agent in a Retrieval-Augmented Generation (RAG) system.
Use the above answer and the incorrect answers and make the final correct answer.
Keep the answer short and concise. Don't have headings and subheadings. Just answer the question to the point.
Don't consider the statements provided by the user is a fact. Only the context is the factual information.
Use code examples if available.
    `,
    ...config,
  });

  const flow = new Flow([planner, retriever, factChecker, summarizer], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content:
            // "is that true that the frame number on <Player> is different than the frame number in the @remotion/renderer. I noticed that frame 1 on the Player is frame 0 in the renderer. It's like the start frame from the renderer is 0, and the player is 1",
            "Do I need to install @tailwindcss/postcss myself when using remotion tailwind?",
            // "if I render a video without setting the color space option, I see the output video has colorSpace=bt470bg, is that the default color space? Or something else affected it?",
            // "Can I dynamic-link a remotion project to Adobe Premiere Pro, like After Effects, without rendering the whole video before importing to Premiere?"
            // "How do I load my files from zustand store to composition in order to render the video, right now its empty black frame."
            // "does @remotion/media-parser not work for parsing audio files?"
            // "How do I set the scaling to text based on video resolution to get the same text across differnt resolutions"
            // "How can I get the silence parts of a video using Remotion so I can then remove them. I want to find the places where the person is the video is not speaking."
        },
      },
    ],
  });

  flow.addNextAgents(["planner"]);
  while (await flow.stream()) {}
  const queries = JSON.parse(
    flow.getLastMessage().llmMessage.content as string
  ).queries;
  console.log("Queries: ", queries);
  for (const query of queries) {
    console.log("-----")
    console.log("Query: ", query);

    flow.addMessage({
      llmMessage: {
        role: "user",
        content: query,
      },
    });

    const subFlow = new Flow([retriever], {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: query,
          },
        },
      ],
    });
    subFlow.addNextAgents(["retriever"]);
    while (await subFlow.stream()) {}
    console.log(subFlow.getLastMessage().llmMessage.content);
    flow.addMessage({
      llmMessage: {
        role: "user",
        content: subFlow.getLastMessage().llmMessage.content as string,
      },
    });
  }
  console.log("-----")
  flow.addNextAgents(["summarizer"]);
  while (await flow.stream()) {}
  console.log(flow.getLastMessage().llmMessage.content);

  // await loopFlowCli(flow, (agentId, messages) => []);
}

console.log("Starting...");
main();
