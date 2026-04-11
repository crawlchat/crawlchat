import type { FaqItem } from "../faq";

export const polotnoFaqItems: FaqItem[] = [
  {
    question: "How does documentation AI help Polotno’s SDK?",
    answer: (
      <p>
        Technical documentation AI helps teams ship faster support for complex
        products: users ask in natural language and get answers grounded in your
        real docs, APIs, and guides. For an embeddable editor SDK, that reduces
        friction between documentation pages and day-to-day integration work.
        CrawlChat indexes your documentation sources and serves consistent
        answers wherever you connect it.
      </p>
    ),
  },
  {
    question: "Why add community threads to your knowledge base?",
    answer: (
      <p>
        Community threads capture real user questions; a knowledge base chatbot
        lets you reuse that signal so future questions get answered from
        documented truth, not scattered posts alone. CrawlChat combines your
        official docs with conversational sources so “AI for documentation”
        stays accurate. You can tighten discovery with features like{" "}
        <a
          href="/changelog/32-search-knowledge-base"
          className="link link-primary link-hover"
        >
          knowledge base search
        </a>{" "}
        and{" "}
        <a
          href="/changelog/24-categories-for-questions"
          className="link link-primary link-hover"
        >
          categories for questions
        </a>
        .
      </p>
    ),
  },
  {
    question: "How does MCP bring docs into dev workflows?",
    answer: (
      <p>
        MCP lets assistants pull answers from your CrawlChat collection inside
        tools developers already use, which complements in-browser documentation
        chatbots. That is a practical form of AI documentation assistance for
        teams shipping SDKs. See how MCP sits next to web, Discord, and Slack in
        the{" "}
        <a
          href="/changelog/33-better-integrate-navigation"
          className="link link-primary link-hover"
        >
          Integrate menu update
        </a>
        {", and compare with "}
        <a href="/case-study/remotion" className="link link-primary link-hover">
          Remotion
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
  {
    question: "How do I embed AI on Polotno-style docs?",
    answer: (
      <p>
        You embed CrawlChat on your documentation website so visitors get an
        assistant that answers from your indexed content. If you use a static
        docs stack, patterns like the{" "}
        <a
          href="/changelog/18-docusaurus-sidepanel"
          className="link link-primary link-hover"
        >
          Docusaurus side panel
        </a>{" "}
        show how the widget can sit alongside doc navigation. Start from{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        to pick a plan that fits your volume.
      </p>
    ),
  },
  {
    question: "Where are more technical-documentation case studies?",
    answer: (
      <p>
        CrawlChat publishes case studies for documentation-heavy products. Read{" "}
        <a href="/case-study/remotion" className="link link-primary link-hover">
          Remotion
        </a>{" "}
        for video-framework docs and{" "}
        <a href="/case-study/postiz" className="link link-primary link-hover">
          Postiz
        </a>{" "}
        for open-source community support. Product updates ship in the{" "}
        <a href="/changelog" className="link link-primary link-hover">
          changelog
        </a>
        .
      </p>
    ),
  },
];
