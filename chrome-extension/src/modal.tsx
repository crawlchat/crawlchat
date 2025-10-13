import { useEffect, useMemo, useRef, useState } from "react";
import { TbAlertCircle, TbCheck, TbPencil } from "react-icons/tb";
import { Config } from "./config";
import cn from "@meltdownjs/cn";

const Modal = ({
  config,
  currentValue,
  onClose,
  onUse,
  submit,
  autoUse,
}: {
  config: Config;
  currentValue: string;
  onClose: () => void;
  onUse: (content: string) => void;
  submit?: boolean;
  autoUse?: boolean;
}) => {
  const [compose, setCompose] = useState<{ content: string; messages: any }>();
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeError, setComposeError] = useState<string>();
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const useBtnRef = useRef<HTMLButtonElement>(null);
  const prompt = useMemo(() => {
    if (!compose) {
      return [currentValue, currentPrompt]
        .map((c) => c.trim())
        .filter(Boolean)
        .join("\n");
    }
    return currentPrompt;
  }, [compose, currentValue, currentPrompt]);

  useEffect(() => {
    if (submit && prompt && config?.apiKey && config.scrapeId && !compose) {
      handleUpdate();
    }
  }, [config, submit, prompt, compose]);

  useEffect(() => {
    if (autoUse && compose && compose.content) {
      onUse(compose.content);
    }
  }, [autoUse, compose, onUse]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function updateCompose(
    prompt: string,
    messages: any,
    formatText: string
  ) {
    setComposeLoading(true);
    setComposeError(undefined);

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "API_COMPOSE",
          config,
          prompt,
          messages,
          formatText,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }
      );
    });

    const result = response as { success: boolean; data?: any; error?: string };

    if (!result.success) {
      setComposeError(result.error || "Unknown error occurred");
      setComposeLoading(false);
      return;
    }

    setCompose({
      content: result.data.content,
      messages: result.data.messages,
    });
    setComposeLoading(false);
    setCurrentPrompt("");

    setTimeout(() => {
      if (useBtnRef.current) {
        useBtnRef.current.focus();
      }
    }, 100);
  }

  function handleUpdate() {
    if (!prompt) return;

    updateCompose(
      prompt,
      JSON.stringify(compose?.messages ?? []),
      config.chatPrompt ?? ""
    );
  }

  function handleUse() {
    if (!compose) return;
    onUse(compose.content);
  }

  return (
    <div
      data-theme="brand"
      className="crawlchat-modal fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-[90%] max-h-[80vh] overflow-hidden transform scale-95 transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <img
              src="https://crawlchat.app/logo.png"
              alt="CrawlChat"
              className="w-10 h-10"
            />
          </div>

          {compose && (
            <div
              className={cn(
                "border border-base-300 border-solid rounded-box",
                "p-4 max-h-[280px] overflow-y-auto"
              )}
              dangerouslySetInnerHTML={{ __html: compose.content }}
            />
          )}

          {composeError && (
            <div className="alert alert-error">
              <TbAlertCircle />
              {composeError}
            </div>
          )}

          {currentValue.trim() && (
            <div
              className={cn(
                "bg-base-100 border border-base-300 line-clamp-1",
                "text-sm p-1 px-3 rounded-box border-solid"
              )}
            >
              About: <span className="italic">{currentValue}</span>
            </div>
          )}

          <textarea
            className="textarea w-full disabled:bg-base-100"
            ref={textareaRef}
            value={currentPrompt}
            rows={2}
            placeholder={compose ? "What to update?" : "What to write about?"}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            disabled={composeLoading}
          />

          <div className="flex gap-4">
            <button
              className="btn btn-neutral flex-1"
              onClick={handleUpdate}
              disabled={composeLoading || !prompt}
              type="button"
            >
              {composeLoading && (
                <span className="loading loading-spinner loading-xs" />
              )}
              <TbPencil />
              {compose ? "Update" : "Write up"}
            </button>
            {compose && (
              <button
                ref={useBtnRef}
                className="btn btn-primary flex-1"
                disabled={composeLoading}
                onClick={handleUse}
                tabIndex={0}
                type="button"
              >
                Use it
                <TbCheck />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
