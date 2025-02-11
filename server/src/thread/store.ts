import { model, Schema } from "mongoose";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

type Thread = {
  id: string;
  messages: ChatCompletionMessageParam[];
  url?: string;
};

interface ThreadDocument extends Document {
  url: String;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatCompletionMessageParam[];
}
const ThreadSchema = new Schema({
  url: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  messages: { type: Array, required: true },
});
const Thread = model("Thread", ThreadSchema);

export async function getThread(threadId: string) {
  return await Thread.findById(threadId);
}

export async function createThread({ url }: { url?: string }) {
  return await Thread.create({
    url,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  });
}

export async function addMessage(
  threadId: string,
  message: ChatCompletionMessageParam
) {
  await Thread.findByIdAndUpdate(threadId, {
    $push: { messages: message },
  });
}
