import {
  TbBrandLinkedin,
  TbBrandTwitter,
  TbChevronDown,
  TbChevronUp,
  TbCopy,
  TbMail,
  TbPencil,
  TbTextCaption,
} from "react-icons/tb";
import { Page } from "./components/page";
import { getAuthUser } from "./auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "./scrapes/util";
import type { Route } from "./+types/compose";
import { createToken } from "libs/jwt";
import { useFetcher } from "react-router";
import { MarkdownProse } from "./widget/markdown-prose";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { RadioCard } from "./components/radio-card";
import cn from "@meltdownjs/cn";
import toast from "react-hot-toast";
import { prisma, type Message, type Thread } from "libs/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");
  const text = url.searchParams.get("text");
  const submit = url.searchParams.get("submit");
  const format = url.searchParams.get("format");
  let thread: (Thread & { messages: Message[] }) | null = null;

  if (threadId) {
    thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        messages: true,
      },
    });
  }

  return {
    user,
    scrapeId,
    thread,
    text,
    submit,
    format,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "compose") {
    let prompt = formData.get("prompt");
    const messages = formData.get("messages");
    const formatText = formData.get("format-text");

    const token = createToken(user!.id);
    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/compose/${scrapeId}`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          messages,
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
      content: data.content,
      messages: data.messages,
    };
  }
}

type ComposeFormat = "markdown" | "email" | "tweet" | "linkedin-post";

export function useComposer({
  scrapeId,
  init,
}: {
  scrapeId: string;
  init?: {
    format?: ComposeFormat;
    formatText?: string;
    state?: { content: string; messages: any[] };
  };
}) {
  const fetcher = useFetcher();
  const [state, setState] = useState<
    { content: string; messages: any[] } | undefined
  >(init?.state);
  const [format, setFormat] = useState<ComposeFormat>(
    init?.format ?? "markdown"
  );
  const [formatText, setFormatText] = useState<string>(init?.formatText ?? "");
  const [formatTextActive, setFormatTextActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (fetcher.data && inputRef.current) {
      inputRef.current.value = "";

      setState({
        content: fetcher.data.content,
        messages: fetcher.data.messages,
      });
      localStorage.setItem(
        `compose-state-${scrapeId}`,
        JSON.stringify(fetcher.data)
      );
    }
  }, [fetcher.data, scrapeId]);

  useEffect(() => {
    if (scrapeId && localStorage.getItem(`compose-state-${scrapeId}`)) {
      setState(JSON.parse(localStorage.getItem(`compose-state-${scrapeId}`)!));
    }
  }, [scrapeId]);

  useEffect(() => {
    setFormatText(localStorage.getItem(`compose-format-${format}`) ?? "");
  }, [format]);

  useEffect(() => {
    localStorage.setItem(`compose-format-${format}`, formatText);
  }, [formatText]);

  return {
    format,
    setFormat,
    formatText,
    setFormatText,
    formatTextActive,
    setFormatTextActive,
    state,
    fetcher,
    inputRef,
    submitRef,
    setState,
  };
}

export type ComposerState = ReturnType<typeof useComposer>;

export function Composer({
  composer,
  children,
  className,
}: PropsWithChildren<{
  composer: ComposerState;
  className?: string;
}>) {
  return (
    <composer.fetcher.Form
      method="post"
      className={className}
      action="/compose"
    >
      <input type="hidden" name="intent" value="compose" />
      <input
        type="hidden"
        name="messages"
        value={JSON.stringify(composer.state?.messages)}
      />
      <input type="hidden" name="format" value={composer.format} />
      <input type="hidden" name="format-text" value={composer.formatText} />

      {children}
    </composer.fetcher.Form>
  );
}

function FormatSelector({ composer }: { composer: ComposerState }) {
  return (
    <div
      className={cn(
        "bg-base-200 p-4 rounded-box border border-base-300 shadow",
        "flex flex-col gap-4"
      )}
    >
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
        value={composer.format}
        onChange={(value) => composer.setFormat(value as ComposeFormat)}
      />
      <div className="flex justify-end">
        <span
          className={cn(
            "text-xs flex items-center gap-1 cursor-pointer",
            "opacity-50 hover:opacity-100"
          )}
          onClick={() => composer.setFormatTextActive((t) => !t)}
        >
          Customise
          {composer.formatTextActive ? <TbChevronUp /> : <TbChevronDown />}
        </span>
      </div>
      {composer.formatTextActive && (
        <textarea
          className="textarea w-full"
          name="format"
          value={composer.formatText}
          onChange={(e) => composer.setFormatText(e.target.value)}
          placeholder="Customise the format"
        />
      )}
    </div>
  );
}

function Form({
  composer,
  primary = true,
  defaultValue,
}: {
  composer: ComposerState;
  primary?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        className="input flex-1"
        type="text"
        name="prompt"
        placeholder="What to update?"
        ref={composer.inputRef}
        defaultValue={defaultValue}
      />
      <button
        type="submit"
        disabled={composer.fetcher.state !== "idle"}
        className={cn("btn", primary && "btn-primary")}
        ref={composer.submitRef}
      >
        {composer.fetcher.state !== "idle" && (
          <span className="loading loading-spinner loading-xs" />
        )}
        {composer.state?.content ? "Update" : "Compose"}
        <TbPencil />
      </button>
    </div>
  );
}

Composer.FormatSelector = FormatSelector;
Composer.Form = Form;

export default function Compose({ loaderData }: Route.ComponentProps) {
  const composer = useComposer({
    scrapeId: loaderData.scrapeId,
    init: {
      format: loaderData.format as ComposeFormat,
    },
  });

  useEffect(() => {
    if (loaderData.submit && composer.submitRef.current) {
      composer.submitRef.current.click();
    }
  }, [loaderData.submit]);

  function handleCopy() {
    navigator.clipboard.writeText(composer.state?.content ?? "");
    toast.success("Copied to clipboard");
  }

  function handleClear() {
    localStorage.removeItem(`compose-state-${loaderData.scrapeId}`);
    composer.setState(undefined);
  }

  return (
    <Page
      title="Compose"
      icon={<TbPencil />}
      right={
        <>
          <button className="btn btn-soft btn-error" onClick={handleClear}>
            Clear
          </button>
          <button className="btn btn-soft btn-primary" onClick={handleCopy}>
            Copy <TbCopy />
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 max-w-prose">
        <div className="text-base-content/50">
          Use this section to compose content for in different formats from your
          knowledge base. Ask any update below and it uses the context to
          componse and update the text. It uses 1 message credit per update.
        </div>
        <Composer
          composer={composer}
          className="flex flex-col gap-4 max-w-prose"
        >
          <FormatSelector composer={composer} />
          <div className="bg-base-200 p-6 rounded-box border border-base-300 shadow">
            <MarkdownProse sources={[]}>
              {composer.state?.content || "Start by asking a question below"}
            </MarkdownProse>
          </div>
          <Form composer={composer} defaultValue={loaderData.text ?? ""} />
        </Composer>
      </div>
    </Page>
  );
}
