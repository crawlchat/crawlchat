import { useDraft } from "~/draft";
import { Container, Heading, HeadingHighlight } from "~/landing/page";
import type { Route } from "./+types/draft-page";
import cn from "@meltdownjs/cn";
import { TbCircleX, TbCopy, TbPlus } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { prisma } from "libs/prisma";
import { createToken } from "libs/jwt";
import { makeMeta } from "~/meta";
import { RateLimiter } from "libs/rate-limiter";

const rateLimiter = new RateLimiter(20, "draft-token");

export async function loader() {
  let token: string | null = null;
  try {
    rateLimiter.check();
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
    token = json.value;
  } catch {}
  return {
    token,
  };
}

export function meta() {
  return makeMeta({
    title: "Draft - CrawlChat",
    description:
      "Write a draft of your article with AI suggestions and providing your own context.",
  });
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "url") {
    const url = formData.get("url");
    const user = await prisma.user.findFirstOrThrow({
      where: {
        email: "pramodkumar.damam73@gmail.com",
      },
    });
    const token = createToken(user.id);
    const response = await fetch(`${process.env.VITE_SERVER_URL}/scrape-url`, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
    return {
      markdown: json.markdown,
      url: url as string,
    };
  }
}

export default function DraftPage({ loaderData }: Route.ComponentProps) {
  const { editor, addContext, handleCopy } = useDraft(loaderData.token ?? "");
  const [urls, setUrls] = useState<{ url: string; markdown: string }[]>([]);
  const urlFetcher = useFetcher();
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (urlFetcher.data) {
      setUrls([
        ...urls,
        { url: urlFetcher.data.url, markdown: urlFetcher.data.markdown },
      ]);
      addContext(urlFetcher.data.markdown);
      if (urlRef.current) {
        urlRef.current.value = "";
      }
    }
  }, [urlFetcher.data]);

  if (!loaderData.token) {
    return (
      <Container>
        <div role="alert" className="alert alert-error">
          <TbCircleX />
          <span>Too many requests. Please try again later.</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Heading>
        Draft with <HeadingHighlight>AI</HeadingHighlight>
      </Heading>
      <p className="text-base-content/50 my-10 max-w-[760px] mx-auto text-center">
        Use this tool to write articles with AI suggestions and providing your
        own context. Add the URLs of the pages as context below. Start writing
        your article and AI will suggest you the next words or sentences from
        the context. Use <kbd className="kbd">Tab</kbd> to accept the
        suggestions or <kbd className="kbd">Esc</kbd> to cancel the suggestions.
      </p>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div
            contentEditable={urls.length > 0}
            onInput={editor.handleInput}
            onKeyDown={editor.handleKeyDown}
            onKeyUp={editor.handleKeyUp}
            onMouseUp={editor.handleMouseUp}
            ref={editor.ref}
            className={cn(
              "border-base-300 border-2 p-4 min-h-[100px]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "rounded-box bg-base-200/50 min-h-[200px]",
              urls.length === 0 && "opacity-50 cursor-not-allowed"
            )}
            suppressContentEditableWarning={true}
          >
            Write a draft
          </div>
          <div className="flex justify-end">
            <button className="btn btn-primary btn-soft" onClick={handleCopy}>
              Copy
              <TbCopy />
            </button>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-2">
          <p>Add any page as context for the draft.</p>
          <urlFetcher.Form method="post">
            <div className="flex gap-2">
              <input type="hidden" name="intent" value="url" />
              <input
                type="text"
                className="input w-full"
                placeholder="URL"
                pattern="^https?://.+"
                ref={urlRef}
                name="url"
                disabled={urlFetcher.state !== "idle"}
              />
              <button
                className="btn btn-neutral"
                type="submit"
                disabled={urlFetcher.state !== "idle" || urls.length >= 3}
              >
                {urlFetcher.state !== "idle" && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Add
                <TbPlus />
              </button>
            </div>
          </urlFetcher.Form>
          <div className="flex flex-col gap-2">
            {urls.map((url, index) => (
              <div
                key={index}
                className={cn(
                  "border border-base-300 rounded-box p-2 px-3",
                  "bg-base-200/50"
                )}
              >
                {url.url}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
