import {
  TbArrowUp,
  TbCheck,
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
import { SettingsSection } from "./settings-section";

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
    const slate = formData.get("slate");

    const token = createToken(user!.id);
    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/compose/${scrapeId}`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          messages,
          formatText,
          slate,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return {
      slate: data.slate,
      messages: data.messages,
    };
  }
}

type ComposeFormat = "markdown" | "email" | "tweet" | "linkedin-post";

export function useComposer({
  scrapeId,
  stateLess,
  init,
}: {
  scrapeId: string;
  stateLess?: boolean;
  init?: {
    format?: ComposeFormat;
    formatText?: string;
    state?: { slate: string; messages: any[] };
    title?: string;
  };
}) {
  const fetcher = useFetcher();
  const [state, setState] = useState<{ slate: string; messages: any[] }>(
    init?.state ?? { slate: "", messages: [] }
  );
  const [format, setFormat] = useState<ComposeFormat>(
    init?.format ?? "markdown"
  );
  const [formatText, setFormatText] = useState<string>(init?.formatText ?? "");
  const [formatTextActive, setFormatTextActive] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>("");
  const [title, setTitle] = useState<string | undefined>(init?.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (fetcher.data && inputRef.current) {
      inputRef.current.value = "";

      console.log(fetcher.data);

      setState({
        slate: fetcher.data.slate,
        messages: fetcher.data.messages,
      });

      if (!stateLess) {
        localStorage.setItem(
          `compose-state-${scrapeId}`,
          JSON.stringify({
            slate: fetcher.data.slate,
            messages: fetcher.data.messages,
          })
        );
      }
    }
  }, [fetcher.data, scrapeId]);

  useEffect(() => {
    if (stateLess) return;

    if (scrapeId && localStorage.getItem(`compose-state-${scrapeId}`)) {
      setState(JSON.parse(localStorage.getItem(`compose-state-${scrapeId}`)!));
    }
  }, [scrapeId]);

  useEffect(() => {
    if (stateLess) return;

    setFormatText(localStorage.getItem(`compose-format-${format}`) ?? "");
  }, [format]);

  useEffect(() => {
    if (stateLess) return;

    localStorage.setItem(`compose-format-${format}`, formatText);
  }, [formatText, stateLess]);

  function setSlate(text: string) {
    setState((old) => {
      const newState = old ?? { slate: "", messages: [] };
      newState.slate = text;
      newState.messages.push({
        role: "assistant",
        content: text,
      });
      return newState;
    });
  }

  function toggleEditMode() {
    if (editMode) {
      setSlate(editText);
    } else {
      setEditText(state.slate);
    }
    setEditMode((e) => !e);
  }

  function askEdit(prompt: string) {
    fetcher.submit(
      {
        intent: "compose",
        prompt,
        messages: JSON.stringify(state?.messages ?? []),
        formatText,
        format,
        slate: state.slate,
      },
      {
        method: "post",
        action: "/compose",
      }
    );
  }

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
    setSlate,
    title,
    setTitle,
    editMode,
    setEditMode,
    toggleEditMode,
    editText,
    setEditText,
    askEdit,
  };
}

export type ComposerState = ReturnType<typeof useComposer>;

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
    <div className="flex gap-2 flex-1">
      <input
        className="input flex-1"
        type="text"
        name="prompt"
        placeholder="What to update?"
        ref={composer.inputRef}
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            composer.askEdit(composer.inputRef.current?.value ?? "");
          }
        }}
        disabled={composer.fetcher.state !== "idle"}
      />
      <div className="tooltip" data-tip="Ask AI to update">
        <button
          type="submit"
          disabled={composer.fetcher.state !== "idle" || composer.editMode}
          className={cn("btn btn-square", primary && "btn-primary")}
          ref={composer.submitRef}
          onClick={() =>
            composer.askEdit(composer.inputRef.current?.value ?? "")
          }
        >
          {composer.fetcher.state !== "idle" ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <TbArrowUp />
          )}
        </button>
      </div>
      <div className="tooltip" data-tip="Edit manually">
        <button
          type="button"
          className={cn("btn btn-square", composer.editMode && "btn-primary")}
          onClick={composer.toggleEditMode}
        >
          {composer.editMode ? <TbCheck /> : <TbPencil />}
        </button>
      </div>
    </div>
  );
}

export function ComposerSection({
  composer,
  sectionRight,
  sectionTitle,
  sectionDescription,
}: {
  composer: ComposerState;
  sectionRight?: React.ReactNode;
  sectionTitle?: string;
  sectionDescription?: string;
}) {
  return (
    <SettingsSection
      title={sectionTitle}
      description={sectionDescription}
      actionRight={
        <div className="flex gap-2 w-full">
          <Form composer={composer} primary={false} />
          {sectionRight}
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <input type="hidden" name="intent" value="save" />
        {composer.title !== undefined && (
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Title</legend>
            <input
              type="text"
              placeholder="Ex: Price details"
              className="input w-full"
              name="title"
              value={composer.title}
            />
          </fieldset>
        )}

        {!composer.editMode && (
          <MarkdownProse sources={[]}>
            {composer.state.slate || "Start by asking a question below"}
          </MarkdownProse>
        )}
        {composer.editMode && (
          <textarea
            className="textarea w-full"
            value={composer.editText}
            onChange={(e) => composer.setEditText(e.target.value)}
          />
        )}
      </div>
    </SettingsSection>
  );
}

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
    navigator.clipboard.writeText(composer.state.slate);
    toast.success("Copied to clipboard");
  }

  function handleClear() {
    localStorage.removeItem(`compose-state-${loaderData.scrapeId}`);
    composer.setState({ slate: "", messages: [] });
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

        <FormatSelector composer={composer} />

        <ComposerSection composer={composer} />
      </div>
    </Page>
  );
}
