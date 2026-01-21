import cn from "@meltdownjs/cn";
import type { LlmModel } from "libs/prisma";
import { useContext, useEffect, useRef } from "react";
import { TbAlertTriangle, TbArrowRight, TbMenu2, TbX } from "react-icons/tb";
import { Link } from "react-router";
import { AppContext } from "~/components/app-context";

const LlmNameMap: Record<LlmModel, string> = {
  gpt_4o_mini: "OpenAI 4o-mini",
  gpt_5_nano: "OpenAI GPT 5-nano",
  gpt_5: "OpenAI GPT 5",
  gpt_5_mini: "OpenAI GPT 5-mini",
  sonnet_4_5: "Claude Sonnet 4.5",
  o3_mini: "OpenAI o3-mini",
  sonnet_3_7: "Claude Sonnet 3.7",
  sonnet_3_5: "Claude Sonnet 3.5",
  gemini_2_5_flash: "Gemini 2.5 Flash",
  gemini_2_5_flash_lite: "Gemini 2.5 Flash Lite",
  o4_mini: "OpenAI o4-mini",
  haiku_4_5: "Claude Haiku 4.5",
};

const release = {
  key: "current-page-context",
  title: "Current page context",
  description: (
    <p>
      You can now enable <strong>Current page context</strong> for your widget.
      When enabled, the widget includes the current page (URL, content and
      title) as part of the conversation context so answers can be more relevant
      to what the user is looking at.
    </p>
  ),
  date: "2025-12-17T00:00:00.000Z",
  cta: {
    label: "Read more",
    href: "/changelog/29-current-page-context",
    icon: <TbArrowRight />,
    target: "_blank",
  },
};

export function Page({
  title,
  icon,
  children,
  right,
  noPadding,
  description,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  right?: React.ReactNode;
  noPadding?: boolean;
  description?: string;
}) {
  const { setContainerWidth, scrape, setClosedReleaseKey, closedReleaseKey } =
    useContext(AppContext);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const productionLlmModels: LlmModel[] = ["sonnet_4_5", "gpt_5", "haiku_4_5"];
  const currentLlmModel = scrape?.llmModel ?? "gpt_4o_mini";

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-base-100 border-b border-base-300">
        <div
          className={cn(
            "flex flex-col p-4 h-[60px]",
            "justify-center sticky top-0 z-10",
            "max-w-[1200px] w-full mx-auto"
          )}
        >
          <div className="flex justify-between gap-2">
            <div className="flex gap-2 items-center">
              <label
                htmlFor="side-menu-drawer"
                className="btn btn-square md:hidden"
              >
                <TbMenu2 />
              </label>
              <div>
                <div className="flex items-center gap-2 text-xl font-medium">
                  {icon && <span className="shrink-0">{icon}</span>}
                  <div className="line-clamp-1">{title}</div>
                </div>
                {description && (
                  <div className="text-xs text-base-content/50 line-clamp-1">
                    {description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">{right}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] w-full mx-auto">
        <div
          className={cn("flex-1 flex flex-col", !noPadding && "p-4")}
          ref={containerRef}
        >
          {closedReleaseKey !== undefined &&
            closedReleaseKey !== release.key && (
              <div
                className={cn(
                  "bg-gradient-to-br from-primary to-primary/80 p-6 rounded-box",
                  "mb-4 text-primary-content shadow-md flex justify-between",
                  "gap-4 flex-col md:flex-row md:items-center"
                )}
              >
                <div className="flex flex-col gap-1 flex-4 pr-10">
                  <div
                    className={cn(
                      "text-2xl font-medium font-radio-grotesk",
                      "flex items-center gap-2"
                    )}
                  >
                    {release.title}
                  </div>
                  <div className="text-primary-content/80">
                    {release.description}
                  </div>
                </div>
                <div className="flex gap-2">
                  {release.cta && (
                    <a
                      href={release.cta.href}
                      target={release.cta.target}
                      className="btn btn-accent"
                    >
                      {release.cta.label}
                      {release.cta.icon}
                    </a>
                  )}
                  <button
                    className="btn btn-neutral btn-square"
                    onClick={() => setClosedReleaseKey(release.key)}
                  >
                    <TbX />
                  </button>
                </div>
              </div>
            )}

          {!productionLlmModels.includes(currentLlmModel) && (
            <div role="alert" className="alert alert-warning alert-dash mb-4">
              <TbAlertTriangle size={20} />
              <span>
                You are using{" "}
                <span className="font-medium">
                  {LlmNameMap[currentLlmModel] ?? currentLlmModel}
                </span>{" "}
                model. This is not fit for public usage. Use one of{" "}
                {productionLlmModels
                  .map((model) => LlmNameMap[model] ?? model)
                  .join(", ")}{" "}
                for better results from{" "}
                <Link to="/settings#ai-model" className="link">
                  here
                </Link>
              </span>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
