import { useRef, useEffect, useState } from "react";
import type { Route } from "./+types/draft";
import cn from "@meltdownjs/cn";
import { getAuthUser } from "./auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "./scrapes/util";
import { useFetcher } from "react-router";
import { TbCopy, TbPencil, TbPlus } from "react-icons/tb";
import { Page } from "./components/page";
import toast from "react-hot-toast";

export async function loader() {
  const response = await fetch(
    "https://api.openai.com/v1/realtime/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expires_after: {
          anchor: "created_at",
          seconds: 600,
        },
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: "You are a friendly assistant.",
        },
      }),
    }
  );

  const json = await response.json();
  return {
    token: json.value,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "topic") {
    const topic = formData.get("topic") as string;
    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/mcp/${scrapeId}?query=${topic}`,
      {
        method: "GET",
      }
    );
    const json = await response.json();
    return {
      topic,
      json,
    };
  }
}

export function useEditor() {
  const ref = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectionInfo, setSelectionInfo] = useState<{
    start: number;
    end: number;
    text: string;
  }>({ start: 0, end: 0, text: "" });
  const [lastInsertedNode, setLastInsertedNode] = useState<Text | null>(null);
  const [suggestionTimeout, setSuggestionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [suggestionRequestedAt, setSuggestionRequestedAt] = useState<
    number | null
  >(null);

  const getCursorPosition = () => {
    if (!ref.current) return 0;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(ref.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  };

  const getSelectionInfo = () => {
    if (!ref.current) return { start: 0, end: 0, text: "" };

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return { start: 0, end: 0, text: "" };
    }

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(ref.current);

    // Get start position
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;

    // Get end position
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = preCaretRange.toString().length;

    const text = selection.toString();

    return { start, end, text };
  };

  const getTextBeforeCursor = () => {
    if (!ref.current) return "";

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return "";

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(ref.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString();
  };

  const handleCursorChange = () => {
    const position = getCursorPosition();
    setCursorPosition(position);
  };

  const handleSelectionChange = () => {
    const info = getSelectionInfo();
    setSelectionInfo(info);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lastInsertedNode) {
      if (
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        e.key !== "Home" &&
        e.key !== "End" &&
        e.key !== "Tab"
      ) {
        // Revert insertion for any other key (Tab is handled in capture phase)
        revertInsertion();
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    // Handle cursor movement keys
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      setTimeout(handleCursorChange, 0);
    }
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      handleCursorChange();
      handleSelectionChange();
    }, 0);
  };

  const handleInput = (e: React.FormEvent) => {
    setTimeout(() => {
      handleCursorChange();
      handleSelectionChange();
    }, 0);

    // Clear existing timeout
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
    }

    // Only trigger suggestion if there's no pending suggestion
    if (!lastInsertedNode) {
      const timeout = setTimeout(async () => {
        setSuggestionRequestedAt(Date.now());
      }, 1000);

      setSuggestionTimeout(timeout);
    }
  };

  useEffect(() => {
    const handleGlobalSelectionChange = () => {
      if (ref.current && ref.current.contains(document.activeElement)) {
        handleSelectionChange();
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        lastInsertedNode &&
        e.key === "Tab" &&
        ref.current &&
        ref.current.contains(document.activeElement)
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Convert gray text to normal text
        convertToNormalText();
        return false;
      }
    };

    document.addEventListener("selectionchange", handleGlobalSelectionChange);
    document.addEventListener("keydown", handleGlobalKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener(
        "selectionchange",
        handleGlobalSelectionChange
      );
      document.removeEventListener("keydown", handleGlobalKeyDown, true);

      // Clear suggestion timeout on cleanup
      if (suggestionTimeout) {
        clearTimeout(suggestionTimeout);
      }
    };
  }, [lastInsertedNode]);

  const convertToNormalText = () => {
    if (!lastInsertedNode) return;

    // Find the span element that contains the gray text
    const spanElement = lastInsertedNode.parentElement;
    if (spanElement && spanElement.tagName === "SPAN") {
      // Create a new text node with the same content but no styling
      const newTextNode = document.createTextNode(
        lastInsertedNode.textContent || ""
      );
      spanElement.parentNode?.replaceChild(newTextNode, spanElement);

      // Move cursor to the end of the converted text
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStartAfter(newTextNode);
        range.setEndAfter(newTextNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // Clear the reference and any pending suggestion timeout
    setLastInsertedNode(null);
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
      setSuggestionTimeout(null);
    }
  };

  const revertInsertion = () => {
    if (!lastInsertedNode) return;

    // Find the span element that contains the gray text
    const spanElement = lastInsertedNode.parentElement;
    if (spanElement && spanElement.tagName === "SPAN") {
      // Remove the entire span element
      spanElement.remove();
    } else {
      // Fallback: remove just the text node
      lastInsertedNode.remove();
    }

    // Clear the reference and any pending suggestion timeout
    setLastInsertedNode(null);
    if (suggestionTimeout) {
      clearTimeout(suggestionTimeout);
      setSuggestionTimeout(null);
    }
  };

  const insertSuggestion = (text: string) => {
    if (!ref.current) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = selection.getRangeAt(0);

    // Create a span with gray text styling and make it non-editable
    const span = document.createElement("span");
    span.style.color = "#6b7280"; // gray-500
    span.setAttribute("contenteditable", "false");
    span.textContent = text;

    range.insertNode(span);

    // Store reference to the inserted node
    setLastInsertedNode(span.firstChild as Text);

    // Keep cursor at the original position (before the inserted text)
    range.setStartBefore(span);
    range.setEndBefore(span);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return {
    ref,
    handleInput,
    handleKeyDown,
    handleKeyUp,
    handleMouseUp,
    suggestionRequestedAt,
    getTextBeforeCursor,
    insertSuggestion,
  };
}

export function useDraft(token: string) {
  const editor = useEditor();
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (editor.suggestionRequestedAt) {
      const textBeforeCursor = editor.getTextBeforeCursor();

      const lastChar = textBeforeCursor[textBeforeCursor.length - 1];
      const isSpace = lastChar === " " || lastChar === "\u00A0";

      // if (!isSpace) {
      //   return;
      // }

      socket.current?.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `
                You are a helpful assistant who helps others to write articles. You are given a text below and you need to continue writing.
                Always give the next few words for the text. Your response should be absolute next words. Nothing else.
                Don't responsd, understood, give me text as well.
                Follow the capitalization of the text, punctuation, etc.
                Use the provided context to fill the text.
                Use markdown formatting for the text.
                Keep the sentenses short and concise.
                
                ${textBeforeCursor}
                `,
              },
            ],
          },
        })
      );

      socket.current?.send(
        JSON.stringify({
          type: "response.create",
          response: {
            output_modalities: ["text"],
          },
        })
      );
    }
  }, [editor.suggestionRequestedAt]);

  useEffect(() => {
    (async () => {
      if (socket.current) return;

      socket.current = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-realtime",
        [
          "realtime",
          // Auth
          "openai-insecure-api-key." + token,
        ]
      );

      socket.current.addEventListener("open", function open() {
        console.log("Connected to server.");
      });

      socket.current.addEventListener("message", function incoming(event) {
        const json = JSON.parse(event.data);
        if (json.type === "response.done") {
          const text = json.response.output[0].content[0].text;
          editor.insertSuggestion(text);
        }
      });
    })();
  }, [token]);

  const addContext = (context: string) => {
    socket.current?.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
              <context>
              ${context}
              </context>
              `,
            },
          ],
        },
      })
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editor.ref.current?.innerText || "");
    toast.success("Copied to clipboard");
  };

  return {
    editor,
    addContext,
    handleCopy,
  };
}

export default function Draft({ loaderData }: Route.ComponentProps) {
  const { editor, addContext, handleCopy } = useDraft(loaderData.token);
  const [topics, setTopics] = useState<{ topic: string; json: any }[]>([]);
  const topicFetcher = useFetcher();

  useEffect(() => {
    if (topicFetcher.data) {
      setTopics([...topics, topicFetcher.data]);
      addContext(JSON.stringify(topicFetcher.data.json));
    }
  }, [topicFetcher.data]);

  return (
    <Page
      title="Draft"
      icon={<TbPencil />}
      right={
        <button className="btn btn-primary" onClick={handleCopy}>
          Copy <TbCopy />
        </button>
      }
    >
      <div className="p-4 flex gap-4">
        <div className="flex-1">
          <div
            contentEditable={topics.length > 0}
            onInput={editor.handleInput}
            onKeyDown={editor.handleKeyDown}
            onKeyUp={editor.handleKeyUp}
            onMouseUp={editor.handleMouseUp}
            ref={editor.ref}
            className={cn(
              "border-base-300 border-2 p-4 min-h-[100px]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "rounded-box bg-base-200/50"
            )}
            suppressContentEditableWarning={true}
          >
            {topics.length > 0
              ? "Write your article here."
              : "Add topics to load from the knowledge base."}
          </div>
        </div>

        <div className="w-96 flex flex-col gap-2">
          <div>
            Draft you articles here about the knowledge base.
            <ul className="list-disc list-inside pl-4 my-2">
              <li>Add topics to load from the knowledge base.</li>
              <li>
                Start writing your article. Give space for the AI suggestion
              </li>
              <li>
                <kbd className="kbd">Tab</kbd> to accept the suggestion.
              </li>
              <li>
                <kbd className="kbd">Esc</kbd> to cancel the suggestion.
              </li>
            </ul>
          </div>
          <topicFetcher.Form method="post">
            <div className="flex gap-2">
              <input type="hidden" name="intent" value="topic" />
              <input
                type="text"
                className="input w-full"
                placeholder="Add topic"
                name="topic"
                disabled={topicFetcher.state !== "idle" || topics.length >= 3}
                required
              />
              <button
                className="btn btn-primary"
                type="submit"
                disabled={topicFetcher.state !== "idle" || topics.length >= 3}
              >
                {topicFetcher.state !== "idle" && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Add
                <TbPlus />
              </button>
            </div>
          </topicFetcher.Form>
          <div className="flex flex-col gap-2">
            {topics.map((topic, index) => (
              <div
                key={index}
                className={cn(
                  "border border-base-300 rounded-box p-2 px-3",
                  "bg-base-200/50"
                )}
              >
                <div>{topic.topic}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
