import { Tool } from "@packages/agentic";
import {
  ApiAction,
  ApiActionDataItem,
  ApiActionDataType,
  Thread,
} from "@prisma/client";
import z, { ZodSchema } from "zod";
import { CustomMessage } from "./custom-message";

export function makeActionTools(
  thread: Thread,
  actions: ApiAction[],
  options?: {
    onPreAction?: (title: string) => void;
    secret?: string;
  }
) {
  function itemToZod(item: ApiActionDataItem) {
    if (item.dataType === "string") {
      return z.string({
        description: item.description,
      });
    }

    if (item.dataType === "number") {
      return z.number({
        description: item.description,
      });
    }

    if (item.dataType === "boolean") {
      return z.boolean({
        description: item.description,
      });
    }

    throw new Error("Invalid item type");
  }

  function titleToId(title: string) {
    return title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function typeCast(value: any, type: ApiActionDataType) {
    if (type === "string") {
      return String(value);
    }
    if (type === "number") {
      return Number(value);
    }
    if (type === "boolean") {
      return Boolean(value);
    }
    throw new Error("Invalid type");
  }

  function makeValue(
    thread: Thread,
    input: Record<string, any>,
    item: ApiActionDataItem
  ) {
    if (item.type === "dynamic") {
      return input[item.key];
    }
    if (item.type === "value") {
      return item.value;
    }
    if (item.description.includes("VERIFIED_EMAIL")) {
      if (!thread.emailVerifiedAt) {
        throw new Error("Email is not verified!");
      }
      if (!thread.emailEntered) {
        throw new Error("Email is not entered!");
      }
      return thread.emailEntered;
    }
    throw new Error("Invalid item type");
  }

  const tools = [];

  for (const action of actions) {
    const dynamicData = action.data.items.filter(
      (i) => i.type === "dynamic" && !i.description.includes("VERIFIED_EMAIL")
    );
    const dynamicHeaders = action.headers.items.filter(
      (i) => i.type === "dynamic"
    );

    const schameItems: Record<string, z.ZodType> = {};

    for (const item of dynamicData) {
      schameItems[item.key] = itemToZod(item);
    }

    for (const item of dynamicHeaders) {
      schameItems[item.key] = itemToZod(item);
    }

    if (!action.type || action.type === "custom") {
      const tool: Tool<ZodSchema<any>, CustomMessage> = {
        id: titleToId(action.title),
        description: action.description,
        schema: z.object(schameItems),
        execute: async (input) => {
          console.log("Executing action", action.id);

          const data: Record<string, any> = {};
          for (const item of action.data.items) {
            data[item.key] = typeCast(
              makeValue(thread, input, item),
              item.dataType
            );
          }

          const queryParams =
            action.method === "get"
              ? "?" + new URLSearchParams(data).toString()
              : "";
          const body =
            action.method === "get" ? undefined : JSON.stringify(data);

          const headers: Record<string, any> = {};
          for (const item of action.headers.items) {
            headers[item.key] = typeCast(
              makeValue(thread, input, item),
              item.dataType
            );

            if (item.value?.includes("{{secret}}")) {
              headers[item.key] = item.value.replace(
                "{{secret}}",
                options?.secret!
              );
            }
          }

          if (options?.onPreAction) {
            options.onPreAction(action.title);
          }

          if (action.requireEmailVerification && !thread.emailVerifiedAt) {
            return {
              content:
                "User needs to verify the email. Use the verify-email rich block to verify the email.",
            };
          }

          const response = await fetch(action.url + queryParams, {
            method: action.method,
            body,
            headers,
          });

          const content = await response.text();

          console.log("Action response", action.id, response.status);
          return {
            content,
            customMessage: {
              actionCall: {
                actionId: action.id,
                data: input,
                response: content,
                statusCode: response.status,
                createdAt: new Date(),
              },
            },
          };
        },
      };

      tools.push(tool);
    }
  }

  return tools;
}
