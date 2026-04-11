import type { FaqItem } from "../faq";

export const postizFaqItems: FaqItem[] = [
  {
    question: "How does documentation AI help Postiz self-hosters?",
    answer: (
      <p>
        Self-hosting users ask deep questions spread across docs, Discord, and
        issue trackers. Documentation AI gives one grounded assistant that
        answers from your knowledge base so maintainers are not repeating the
        same documentation answers in chat. CrawlChat is built for that pattern:
        index docs and community sources, then deliver AI for documentation on
        your site and in Discord.
      </p>
    ),
  },
  {
    question: "Can CrawlChat use Notion, GitHub, YouTube, and Discord?",
    answer: (
      <p>
        Yes. You connect sources that hold your truth—docs sites, Notion, GitHub
        issues, YouTube transcripts, and more—then serve answers through your
        chosen channels. That is how teams build a knowledge base chatbot
        without duplicating content by hand. See connectors such as{" "}
        <a
          href="/changelog/8-notion-connector"
          className="link link-primary link-hover"
        >
          Notion
        </a>
        ,{" "}
        <a
          href="/changelog/31-github-discussions-source"
          className="link link-primary link-hover"
        >
          GitHub discussions
        </a>
        , and{" "}
        <a
          href="/changelog/27-youtube-transcript-source"
          className="link link-primary link-hover"
        >
          YouTube transcripts
        </a>
        , plus Discord-focused updates like{" "}
        <a
          href="/changelog/17-image-attachments-on-discord"
          className="link link-primary link-hover"
        >
          Discord attachments
        </a>
        .
      </p>
    ),
  },
  {
    question: "What matters when picking documentation AI tools?",
    answer: (
      <p>
        Prioritize tools that ground answers in your sources, support your
        channels (website and Discord are common for OSS), and give visibility
        into questions so you can improve docs. CrawlChat focuses on technical
        documentation AI with analytics and multi-source ingestion. Compare
        plans on{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        and read parallel deployments on{" "}
        <a
          href="/case-study/localstack"
          className="link link-primary link-hover"
        >
          LocalStack
        </a>{" "}
        and{" "}
        <a href="/case-study/remotion" className="link link-primary link-hover">
          Remotion
        </a>
        .
      </p>
    ),
  },
  {
    question: "How does a KB chatbot cut repeat questions?",
    answer: (
      <p>
        The chatbot answers from indexed documentation and tracked issues, so
        users see consistent responses with citations instead of asking humans
        the same questions repeatedly. Over time you can spot gaps and improve
        documentation quality. Follow product improvements in the{" "}
        <a href="/changelog" className="link link-primary link-hover">
          changelog
        </a>
        , including GitHub-oriented features like the{" "}
        <a
          href="/changelog/35-github-bot"
          className="link link-primary link-hover"
        >
          GitHub bot
        </a>
        .
      </p>
    ),
  },
  {
    question: "Where do I start with pricing for docs and Discord?",
    answer: (
      <p>
        Start from{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        to compare plans, trials, and credits. For context on similar teams,
        read{" "}
        <a
          href="/case-study/localstack"
          className="link link-primary link-hover"
        >
          LocalStack
        </a>{" "}
        for large multi-source knowledge bases and{" "}
        <a href="/case-study/polotno" className="link link-primary link-hover">
          Polotno
        </a>{" "}
        for SDK-style documentation AI.
      </p>
    ),
  },
];
