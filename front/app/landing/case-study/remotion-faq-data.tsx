import type { FaqItem } from "../faq";

export const remotionFaqItems: FaqItem[] = [
  {
    question: "How does documentation AI help Remotion?",
    answer: (
      <p>
        Documentation AI turns your existing technical documentation into
        grounded answers so developers get instant help instead of searching
        long doc pages. For documentation-heavy products, that means common
        questions are answered on your site and in community channels while
        staying tied to your real docs. CrawlChat is built for that workflow:
        index your docs, then deliver answers with sources on the channels you
        already use.
      </p>
    ),
  },
  {
    question: "Why use MCP and a docs-site chatbot together?",
    answer: (
      <p>
        A website widget helps visitors on your docs site; an MCP server brings
        the same knowledge base chatbot-style answers into the IDE so
        developers can query documentation without leaving their editor. Teams
        often run both so “AI for documentation” covers the browser and the
        toolchain. See how collections expose MCP in the{" "}
        <a
          href="/changelog/49-mcp-api-for-collections"
          className="link link-primary link-hover"
        >
          MCP for collections
        </a>{" "}
        changelog post, and compare with{" "}
        <a
          href="/case-study/polotno"
          className="link link-primary link-hover"
        >
          Polotno
        </a>{" "}
        and{" "}
        <a
          href="/case-study/localstack"
          className="link link-primary link-hover"
        >
          LocalStack
        </a>{" "}
        for other MCP-heavy setups.
      </p>
    ),
  },
  {
    question: "How does a Discord bot cut repetitive doc questions?",
    answer: (
      <p>
        A Discord bot connected to your knowledge base can answer first-line
        documentation questions with citations, so maintainers spend less time
        repeating what is already in the docs. Features like threaded replies
        and learning from reactions help the bot improve over time. Read about
        Discord workflows in{" "}
        <a
          href="/changelog/14-learn-by-reaction-discord-slack"
          className="link link-primary link-hover"
        >
          learning from reactions
        </a>{" "}
        and channel context in{" "}
        <a
          href="/changelog/15-discord-reply-thread-channel-names"
          className="link link-primary link-hover"
        >
          Discord reply threads
        </a>
        .
      </p>
    ),
  },
  {
    question: "How do I embed AI on a Docusaurus-style site?",
    answer: (
      <p>
        You add CrawlChat’s embed to your documentation site so visitors get an
        AI assistant that only answers from your indexed content. For
        Docusaurus-style setups, the side panel flow is a common pattern. See the{" "}
        <a
          href="/changelog/18-docusaurus-sidepanel"
          className="link link-primary link-hover"
        >
          Docusaurus side panel
        </a>{" "}
        changelog entry, then review{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        for plans and trials that match your traffic.
      </p>
    ),
  },
  {
    question: "What should OSS projects look for in documentation AI?",
    answer: (
      <p>
        Look for software documentation tools that support multiple sources,
        source-linked answers, and the channels your community uses (docs
        site, Discord, MCP). CrawlChat is designed as documentation AI for
        developer products: grounded responses, analytics, and multi-channel
        delivery. Explore{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>
        , skim recent launches in{" "}
        <a href="/changelog" className="link link-primary link-hover">
          changelog
        </a>
        , and read parallel stories on{" "}
        <a
          href="/case-study/postiz"
          className="link link-primary link-hover"
        >
          Postiz
        </a>{" "}
        and{" "}
        <a
          href="/case-study/localstack"
          className="link link-primary link-hover"
        >
          LocalStack
        </a>
        .
      </p>
    ),
  },
];
