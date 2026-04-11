import type { FaqItem } from "../faq";

export const localstackFaqItems: FaqItem[] = [
  {
    question: "How does documentation AI span Slack, docs, and MCP?",
    answer: (
      <p>
        You unify sources into one knowledge base, then deliver the same
        grounded answers on your documentation website, in Slack, and through
        MCP for IDE workflows. That is how teams scale AI for documentation
        when page count and channels both grow: one index, many surfaces.
        CrawlChat supports that architecture for technical documentation AI at
        scale.
      </p>
    ),
  },
  {
    question: "What is unifying Slack with documentation?",
    answer: (
      <p>
        Slack holds informal questions and context; your docs hold authoritative
        answers. A unified knowledge base chatbot lets Slack users get answers
        that still trace back to documentation and other indexed sources, so
        support stays consistent. See Slack-focused updates like the{" "}
        <a
          href="/changelog/7-slack-bot"
          className="link link-primary link-hover"
        >
          Slack bot
        </a>
        ,{" "}
        <a
          href="/changelog/11-slack-private-learn"
          className="link link-primary link-hover"
        >
          private Slack learning
        </a>
        , and{" "}
        <a
          href="/changelog/44-react-to-answer-on-slack-and-discord"
          className="link link-primary link-hover"
        >
          reactions on Slack and Discord
        </a>
        .
      </p>
    ),
  },
  {
    question: "How do doc tools handle thousands of pages?",
    answer: (
      <p>
        The system indexes your sources, retrieves relevant passages, and
        answers with citations so users can verify claims against real docs.
        Features like search and data-gap insights help teams prioritize doc
        fixes. Explore{" "}
        <a
          href="/changelog/32-search-knowledge-base"
          className="link link-primary link-hover"
        >
          knowledge base search
        </a>{" "}
        and{" "}
        <a href="/changelog/13-data-gaps" className="link link-primary link-hover">
          data gaps
        </a>
        , then review{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        for capacity that matches large collections.
      </p>
    ),
  },
  {
    question: "Why add MCP if we already have a docs widget?",
    answer: (
      <p>
        MCP brings the same collection into developer tools so “documentation
        search” happens inside the workflow, not only in the browser. That
        complements your public documentation AI surface. Read{" "}
        <a
          href="/changelog/49-mcp-api-for-collections"
          className="link link-primary link-hover"
        >
          MCP for collections
        </a>{" "}
        and compare with{" "}
        <a
          href="/case-study/remotion"
          className="link link-primary link-hover"
        >
          Remotion
        </a>
        .
      </p>
    ),
  },
  {
    question: "How do Chrome extensions and YouTube feed documentation AI?",
    answer: (
      <p>
        CrawlChat meets users where they work: browser extensions add context
        outside your docs site, and YouTube transcripts can feed the knowledge
        base for tutorial-heavy teams. See{" "}
        <a
          href="/changelog/42-chrome-extension-context-menu"
          className="link link-primary link-hover"
        >
          Chrome extension context menu
        </a>
        ,{" "}
        <a
          href="/changelog/27-youtube-transcript-source"
          className="link link-primary link-hover"
        >
          YouTube transcripts
        </a>
        , and browse all releases in the{" "}
        <a href="/changelog" className="link link-primary link-hover">
          changelog
        </a>
        .
      </p>
    ),
  },
  {
    question: "Which case studies match large cloud-style docs?",
    answer: (
      <p>
        Read{" "}
        <a
          href="/case-study/postiz"
          className="link link-primary link-hover"
        >
          Postiz
        </a>{" "}
        for open-source community support and{" "}
        <a
          href="/case-study/remotion"
          className="link link-primary link-hover"
        >
          Remotion
        </a>{" "}
        for MCP-heavy developer documentation AI. Start a trial from{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>{" "}
        when you are ready to evaluate CrawlChat on your own docs.
      </p>
    ),
  },
];
