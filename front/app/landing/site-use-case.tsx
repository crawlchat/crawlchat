import cn from "@meltdownjs/cn";
import { Heading, HeadingHighlight } from "./page";
import {
  TbArrowRight,
  TbBook,
  TbBrandDiscord,
  TbBrandGithub,
  TbBrandSlack,
  TbBrandYoutube,
  TbCode,
} from "react-icons/tb";
import { useFetcher } from "react-router";
import { useMemo, useState } from "react";
import { track } from "~/track";

export function SiteUseCase() {
  const fetcher = useFetcher<{
    result: {
      name: string;
      description: string;
      faviconUrl?: string;
      githubUrl?: string;
      isOpenSource: boolean;
      discordUrl?: string;
      slackUrl?: string;
      docsWebsiteUrl?: string;
      youtubeChannelUrl?: string;
      isSoftware: boolean;
    };
    error?: string;
  }>();
  const [url, setUrl] = useState<string>("");
  const report = useMemo(() => {
    // fetcher.data = {
    //   result: {
    //     name: "Remotion",
    //     description:
    //       "Make videos programmatically. Create real MP4 videos with React. Parametrize content, render server-side and build applications.",
    //     faviconUrl: "https://www.remotion.dev/img/favicon.png",
    //     githubUrl: "https://github.com/remotion-dev/remotion",
    //     isOpenSource: true,
    //     discordUrl: "https://remotion.dev/discord",
    //     docsWebsiteUrl: "https://remotion.dev/docs/",
    //     youtubeChannelUrl: "https://youtube.com/@remotion_dev",
    //     isSoftware: true,
    //   },
    // };

    if (!fetcher.data) return null;
    if (fetcher.data.error) return null;

    const reasons = [];
    if (fetcher.data.result.isSoftware) {
      reasons.push({
        icon: <TbCode />,
        title: "It is a software. Reduce support tickets by 80%",
      });
    }
    if (fetcher.data.result.isOpenSource) {
      reasons.push({
        icon: <TbBrandGithub />,
        title:
          "Open source. Your community needs someone to answer their questions",
      });
    }
    if (fetcher.data.result.docsWebsiteUrl) {
      reasons.push({
        icon: <TbBook />,
        title: "Found Documentation. Embed AI assistant on your docs website",
      });
    }
    if (fetcher.data.result.discordUrl) {
      reasons.push({
        icon: <TbBrandDiscord />,
        title:
          "Found Discord server. Add Discord bot that answers questions on your behalf",
      });
    }
    if (fetcher.data.result.slackUrl) {
      reasons.push({
        icon: <TbBrandSlack />,
        title:
          "Found Slack workspace. Add Slack bot that answers questions on your behalf",
      });
    }
    if (fetcher.data.result.githubUrl) {
      reasons.push({
        icon: <TbBrandGithub />,
        title:
          "Found GitHub repository. Make the Github issues answer the questions",
      });
    }
    if (fetcher.data.result.youtubeChannelUrl) {
      reasons.push({
        icon: <TbBrandYoutube />,
        title:
          "Found YouTube channel. Turn it into a knowledge base that answers questions",
      });
    }

    return {
      reasons: reasons,
      result: fetcher.data.result,
    };
  }, [fetcher.data]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    track("use_case_submit", {
      url: url,
    });
  }

  return (
    <div className="mt-32">
      <Heading>
        How it can <HeadingHighlight>help you?</HeadingHighlight>
      </Heading>

      <div
        className={cn(
          "border border-base-300 rounded-box p-4 mt-12",
          "flex flex-col md:flex-row gap-8"
        )}
      >
        {!report && fetcher.state === "idle" && (
          <>
            <div className="flex-1">
              Still not sure how it can help you? Enter your product URL and
              find out the reasons why you should use CrawlChat.
            </div>
            <fetcher.Form
              method="post"
              className="flex-1 flex flex-col md:flex-row gap-2"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="intent" value="site-use-case" />
              <input
                name="url"
                type="text"
                className="input w-full input-lg"
                placeholder="Enter your website URL"
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={fetcher.state !== "idle"}
              >
                {fetcher.state !== "idle" && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                Check
                <TbArrowRight />
              </button>
            </fetcher.Form>
          </>
        )}
        {fetcher.state !== "idle" && (
          <div>
            <p>Analysing {url}...</p>
          </div>
        )}
        {report && (
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <p className="flex text-3xl font-semibold items-center gap-2">
                {report.result.faviconUrl && (
                  <img
                    src={report.result.faviconUrl}
                    alt={report.result.name}
                    className="w-8 h-8 rounded-box"
                  />
                )}
                {report.result.name}
              </p>
              <p>
                {report.reasons.length} reason
                {report.reasons.length > 1 ? "s" : ""} found to use CrawlChat
              </p>
              <p className="mt-2">
                <a
                  href={"/pricing"}
                  target="_blank"
                  className="btn btn-primary btn-lg w-full md:w-auto"
                  data-fast-goal="use_case_cta"
                >
                  Start free trial now
                  <TbArrowRight />
                </a>
              </p>
            </div>
            <ul className="flex-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.reasons.map((reason) => (
                <li key={reason.title} className="flex gap-2">
                  <span className="text-primary mt-1">{reason.icon}</span>
                  {reason.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
