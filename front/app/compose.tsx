import {
  TbBrandLinkedin,
  TbBrandTwitter,
  TbCheck,
  TbChevronDown,
  TbChevronUp,
  TbCopy,
  TbMail,
  TbPencil,
  TbQuestionMark,
  TbTextCaption,
} from "react-icons/tb";
import { Page } from "./components/page";
import { getAuthUser } from "./auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "./scrapes/util";
import type { Route } from "./+types/compose";
import { createToken } from "libs/jwt";
import { useFetcher } from "react-router";
import { MarkdownProse } from "./widget/markdown-prose";
import { useEffect, useRef, useState } from "react";
import { RadioCard } from "./components/radio-card";
import cn from "@meltdownjs/cn";
import toast from "react-hot-toast";

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "compose") {
    const prompt = formData.get("prompt");
    const messages = formData.get("messages");
    const format = formData.get("format");
    const formatText = formData.get("format-text");

    const token = createToken(user!.id);
    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/compose/${scrapeId}`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          messages,
          format,
          formatText,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return {
      answer: data.answer,
      messages: data.messages,
    };
  }
}

type ComposeFormat = "markdown" | "email" | "tweet" | "linkedin-post";

export default function Compose() {
  const fetcher = useFetcher();
  const [format, setFormat] = useState<ComposeFormat>("markdown");
  const [formatText, setFormatText] = useState<string>("");
  const [formatTextActive, setFormatTextActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetcher.data && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [fetcher.data]);

  useEffect(() => {
    setFormatText(localStorage.getItem(`compose-format-${format}`) ?? "");
  }, [format]);

  useEffect(() => {
    localStorage.setItem(`compose-format-${format}`, formatText);
  }, [formatText]);

  function handleCopy() {
    navigator.clipboard.writeText(fetcher.data?.answer ?? "");
    toast.success("Copied to clipboard");
  }

  return (
    <Page
      title="Compose"
      icon={<TbPencil />}
      right={
        <button className="btn btn-soft btn-primary" onClick={handleCopy}>
          Copy <TbCopy />
        </button>
      }
    >
      <fetcher.Form method="post" className="flex flex-col gap-4 max-w-prose">
        <div className="text-base-content/50">
          Use this section to compose content for in different formats from your
          knowledge base. Ask any update below and it uses the context to
          componse and update the text. It uses 1 message credit per update.
        </div>

        <input type="hidden" name="intent" value="compose" />
        <input
          type="hidden"
          name="messages"
          value={JSON.stringify(fetcher.data?.messages)}
        />
        <input type="hidden" name="format" value={format} />

        <div
          className={cn(
            "bg-base-200 p-4 rounded-box border border-base-300 shadow",
            "flex flex-col gap-4"
          )}
        >
          <input type="hidden" name="format" value={format} />
          <input type="hidden" name="format-text" value={formatText} />
          <RadioCard
            cols={2}
            options={[
              {
                label: "Markdown",
                icon: <TbTextCaption />,
                value: "markdown",
              },
              {
                label: "Email",
                icon: <TbMail />,
                value: "email",
              },
              {
                label: "Tweet",
                icon: <TbBrandTwitter />,
                value: "tweet",
              },
              {
                label: "LinkedIn Post",
                icon: <TbBrandLinkedin />,
                value: "linkedin-post",
              },
            ]}
            value={format}
            onChange={(value) => setFormat(value as ComposeFormat)}
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs flex items-center gap-1 cursor-pointer",
                "opacity-50 hover:opacity-100"
              )}
              onClick={() => setFormatTextActive((t) => !t)}
            >
              Customise
              {formatTextActive ? <TbChevronUp /> : <TbChevronDown />}
            </span>
          </div>
          {formatTextActive && (
            <textarea
              className="textarea w-full"
              name="format"
              value={formatText}
              onChange={(e) => setFormatText(e.target.value)}
              placeholder="Customise the format"
            />
          )}
        </div>

        <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow">
          <MarkdownProse sources={[]}>
            {fetcher.data?.answer || "Start by asking a question below"}
          </MarkdownProse>
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            type="text"
            name="prompt"
            placeholder="What to update?"
            disabled={fetcher.state !== "idle"}
            ref={inputRef}
          />
          <button
            type="submit"
            disabled={fetcher.state !== "idle"}
            className="btn btn-primary"
          >
            {fetcher.state !== "idle" && (
              <span className="loading loading-spinner loading-xs" />
            )}
            {fetcher.data?.answer ? "Update" : "Compose"}
            <TbCheck />
          </button>
        </div>
      </fetcher.Form>
    </Page>
  );
}
