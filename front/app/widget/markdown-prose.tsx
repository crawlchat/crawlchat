import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { useState, type PropsWithChildren } from "react";
import { TbArrowRight, TbCheck, TbCopy } from "react-icons/tb";
import { jsonrepair } from "jsonrepair";
const linkifyRegex = require("remark-linkify-regex");
import "./markdown-prose.css";
import "highlight.js/styles/vs.css";

const RichCreateTicket = ({
  title: initialTitle,
  message: initialMessage,
  onTicketCreate,
  loading,
  disabled,
  customerEmail,
}: {
  title: string;
  message: string;
  onTicketCreate: (email: string, title: string, message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  customerEmail?: string;
}) => {
  const [email, setEmail] = useState(customerEmail ?? "");
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);

  function handleSubmit() {
    if (!email || !title || !message) {
      alert("Please fill in all fields");
      return;
    }

    onTicketCreate(email, title, message);
  }

  return (
    <div className="flex flex-col gap-2 border-4 border-brand-outline p-4 rounded-2xl max-w-400px w-full my-8">
      {!loading && (
        <>
          <div className="text-lg font-bold">Create a support ticket</div>
          <input
            className="input input-sm input-bordered"
            placeholder="Title"
            defaultValue={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={disabled}
          />
          <textarea
            className="textarea textarea-sm textarea-bordered"
            placeholder="Message"
            defaultValue={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={disabled}
          />
          <input
            className="input input-sm input-bordered"
            placeholder="Email"
            defaultValue={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || !!customerEmail}
          />
          <div className="flex justify-end">
            <button
              className="btn btn-sm"
              onClick={handleSubmit}
              disabled={disabled}
            >
              {loading && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Create <TbArrowRight />
            </button>
          </div>
        </>
      )}
      {loading && (
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner" />
        </div>
      )}
    </div>
  );
};

export function MarkdownProse({
  children,
  noMarginCode,
  sources,
  size = "md",
  options,
}: PropsWithChildren<{
  noMarginCode?: boolean;
  sources?: Array<{ title: string; url?: string }>;
  size?: "md" | "lg";
  options?: {
    onTicketCreate?: (
      title: string,
      description: string,
      email: string
    ) => void;
    ticketCreateLoading?: boolean;
    disabled?: boolean;
    customerEmail?: string;
    onSourceMouseEnter?: (index: number) => void;
    onSourceMouseLeave?: () => void;
  };
}>) {
  const [copied, setCopied] = useState(false);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="prose markdown-prose">
      <Markdown
        remarkPlugins={[remarkGfm, linkifyRegex(/\!\![0-9a-zA-Z]+!!/)]}
        components={{
          code: ({ node, ...props }) => {
            const { children, className, ...rest } = props;

            if (!className) {
              return <code {...rest}>{children}</code>;
            }

            let language = className?.replace("language-", "");

            if (language.startsWith("json|")) {
              try {
                const json = JSON.parse(jsonrepair(children as string));
                if (
                  language === "json|create-ticket" &&
                  options?.onTicketCreate
                ) {
                  return (
                    <RichCreateTicket
                      {...json}
                      onTicketCreate={options.onTicketCreate}
                      loading={options.ticketCreateLoading}
                      disabled={options.disabled}
                      customerEmail={options.customerEmail}
                    />
                  );
                }
              } catch (e) {
                console.log(e);
                return null;
              }
            }

            if (!hljs.listLanguages().includes(language)) {
              language = "bash";
            }
            const code = children as string;

            const highlighted = hljs.highlight(code ?? "", {
              language: language ?? "javascript",
            }).value;

            return (
              <div className="group">
                <div dangerouslySetInnerHTML={{ __html: highlighted }} />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => copyCode(code)}
                    disabled={copied}
                  >
                    {copied ? <TbCheck /> : <TbCopy />}
                  </button>
                </div>
              </div>
            );
          },
          pre: ({ node, ...props }) => {
            const { children, ...rest } = props;

            if (
              (children as any).props.className?.startsWith("language-json|")
            ) {
              return <div className="my-2">{children}</div>;
            }

            return (
              <pre
                {...rest}
                style={{
                  margin: noMarginCode ? 0 : undefined,
                  position: "relative",
                }}
              >
                {children}
              </pre>
            );
          },
          a: ({ node, ...props }) => {
            const { children, ...rest } = props;

            const defaultNode = <a {...rest}>{children}</a>;
            if (!sources || typeof children !== "string") {
              return children;
            }

            const match = children.match(/\!\!([0-9]*)!!/);
            if (children.startsWith("!!") && !match) {
              return null;
            } else if (!match) {
              return defaultNode;
            }

            const index = parseInt(match[1]);
            const source = sources[index];

            return index + 1;

            return (
              <span
                className="tooltip"
                data-tip={source?.title ?? "Loading..."}
              >
                <span
                  className="badge badge-soft px-1 translate-y-[-6px]"
                  onMouseEnter={() => options?.onSourceMouseEnter?.(index)}
                  onMouseLeave={() => options?.onSourceMouseLeave?.()}
                >
                  {source?.url ? (
                    <a href={source.url} target="_blank">
                      {index + 1}
                    </a>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
              </span>
            );
          },
        }}
      >
        {children as string}
      </Markdown>
    </div>
  );
}
