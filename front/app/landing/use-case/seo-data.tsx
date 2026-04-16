import type { FaqItem } from "../faq";

export type UseCaseKeywordTargets = {
  primary: string;
  secondary: string[];
  longTail: string[];
};

export const communitySupportKeywords: UseCaseKeywordTargets = {
  primary: "documentation assistant",
  secondary: [
    "support chatbot",
    "customer support chatbot",
    "knowledge base chatbot",
    "discord support bot",
    "help center chatbot",
  ],
  longTail: [
    "how to add a support chatbot to documentation",
    "community support bot for SaaS docs",
    "discord support bot for product docs",
    "knowledge base chatbot with source citations",
  ],
};

export const communitySupportFaqs: FaqItem[] = [
  {
    question: "What is a documentation assistant for community support?",
    answer: (
      <span>
        A documentation assistant is a support chatbot trained on your docs, so
        users get instant answers without waiting for your team. CrawlChat can
        answer in web chat, Discord, and Slack using the same knowledge base.
      </span>
    ),
  },
  {
    question:
      "How does a support chatbot reduce repetitive community questions?",
    answer: (
      <span>
        Most community questions repeat topics already covered in docs. A
        support chatbot resolves these instantly and lets your team focus on
        complex issues. You can track performance in analytics from{" "}
        <a href="/app" className="link link-primary link-hover">
          dashboard
        </a>
        . If your goal is stronger ticket reduction, see{" "}
        <a
          href="/use-case/customer-support-automation"
          className="link link-primary link-hover"
        >
          customer support automation
        </a>
        .
      </span>
    ),
  },
  {
    question: "Can I run the same bot in Discord and Slack?",
    answer: (
      <span>
        Yes. You can deploy a Discord support bot and Slack bot from the same
        documentation collection. See channel setup details on{" "}
        <a href="/discord-bot" className="link link-primary link-hover">
          Discord bot
        </a>
        , and for deeper Discord workflows visit{" "}
        <a
          href="/use-case/discord-community-automation"
          className="link link-primary link-hover"
        >
          Discord community automation
        </a>
        .
      </span>
    ),
  },
  {
    question: "How do I keep answers accurate and grounded?",
    answer: (
      <span>
        CrawlChat includes source links and answer scoring so you can review
        quality and improve weak areas. You can also tune model behavior from{" "}
        <a href="/ai-models" className="link link-primary link-hover">
          AI models
        </a>{" "}
        settings.
      </span>
    ),
  },
];

export const empowerGtmKeywords: UseCaseKeywordTargets = {
  primary: "internal knowledge base",
  secondary: [
    "internal documentation",
    "sales enablement software",
    "knowledge management software",
    "team knowledge base",
    "product knowledge base",
  ],
  longTail: [
    "how to build an internal knowledge base for gtm teams",
    "sales enablement with internal documentation",
    "private ai assistant for go to market teams",
    "product knowledge base for sales and support",
  ],
};

export const empowerGtmFaqs: FaqItem[] = [
  {
    question: "Why do GTM teams need an internal knowledge base?",
    answer: (
      <span>
        GTM teams depend on up-to-date product context to position clearly and
        answer buyer questions fast. A unified internal knowledge base helps
        sales, success, and support stay aligned on one source of truth. You can
        also use the same docs externally through{" "}
        <a
          href="/use-case/community-support"
          className="link link-primary link-hover"
        >
          community support
        </a>
        .
      </span>
    ),
  },
  {
    question: "Can this work with private internal documentation?",
    answer: (
      <span>
        Yes. CrawlChat supports private sources and private channels so your
        internal assistant only responds to authorized users. You can manage
        access and collaboration workflows from{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing plans
        </a>
        .
      </span>
    ),
  },
  {
    question: "How does this help sales enablement workflows?",
    answer: (
      <span>
        Sales enablement improves when reps can ask deal-specific questions and
        get answers from docs, release notes, and issue history. CrawlChat
        reduces time spent searching across disconnected tools. Teams that also
        handle user tickets can pair this with{" "}
        <a
          href="/use-case/customer-support-automation"
          className="link link-primary link-hover"
        >
          customer support automation
        </a>
        .
      </span>
    ),
  },
  {
    question: "How can we validate answer quality for internal teams?",
    answer: (
      <span>
        Use conversation analytics, answer feedback, and confidence scoring to
        identify weak spots in documentation. For model options, review{" "}
        <a href="/ai-models" className="link link-primary link-hover">
          supported AI models
        </a>
        .
      </span>
    ),
  },
];

export const customerSupportAutomationKeywords: UseCaseKeywordTargets = {
  primary: "customer support automation",
  secondary: [
    "customer service automation",
    "help desk automation",
    "customer support chatbot",
    "knowledge base chatbot",
    "ticket deflection",
  ],
  longTail: [
    "how to reduce support tickets with documentation",
    "what is ticket deflection in customer support",
    "best customer support chatbot for technical docs",
    "help center chatbot with source citations",
  ],
};

export const customerSupportAutomationFaqs: FaqItem[] = [
  {
    question: "What is customer support automation for documentation teams?",
    answer: (
      <span>
        Customer support automation uses your docs to answer common questions
        automatically before they become tickets. This reduces manual workload
        while keeping answers grounded in your official documentation.
      </span>
    ),
  },
  {
    question: "How does ticket deflection work in practice?",
    answer: (
      <span>
        Ticket deflection happens when users get the right answer in chat
        without opening a support case. CrawlChat tracks conversations so you
        can monitor deflection signals and improve weak areas over time. If
        support is mostly happening in Discord, also check{" "}
        <a
          href="/use-case/discord-community-automation"
          className="link link-primary link-hover"
        >
          Discord community automation
        </a>
        .
      </span>
    ),
  },
  {
    question: "Can a help center chatbot escalate to human support?",
    answer: (
      <span>
        Yes. You can keep automation for repetitive questions and route complex
        cases to your team. For support handoff workflows, see{" "}
        <a href="/support-tickets" className="link link-primary link-hover">
          support tickets
        </a>
        .
      </span>
    ),
  },
  {
    question: "What channels can we use for support automation?",
    answer: (
      <span>
        You can deploy the same knowledge base on web chat, Discord, Slack, and
        API integrations. For implementation details, start with{" "}
        <a href="/pricing" className="link link-primary link-hover">
          pricing
        </a>
        . You can also deploy this pattern for public users with{" "}
        <a
          href="/use-case/community-support"
          className="link link-primary link-hover"
        >
          community support
        </a>
        .
      </span>
    ),
  },
];

export const discordCommunityAutomationKeywords: UseCaseKeywordTargets = {
  primary: "discord ticket bot",
  secondary: [
    "ticket bot discord",
    "discord moderation bot",
    "discord customer support",
    "discord chatbot",
    "discord support bot",
  ],
  longTail: [
    "how to set up discord ticket bot for support",
    "discord moderation bot for product communities",
    "discord customer support automation workflows",
    "best discord chatbot for documentation",
  ],
};

export const discordCommunityAutomationFaqs: FaqItem[] = [
  {
    question: "How does a Discord ticket bot help support teams?",
    answer: (
      <span>
        A Discord ticket bot resolves common questions directly from docs and
        helps collect context when escalation is needed. This reduces moderator
        load and improves first-response speed. For broader web and help center
        deflection, combine this with{" "}
        <a
          href="/use-case/customer-support-automation"
          className="link link-primary link-hover"
        >
          customer support automation
        </a>
        .
      </span>
    ),
  },
  {
    question: "Can we combine moderation and support automation in Discord?",
    answer: (
      <span>
        Yes. You can pair support automation with moderation workflows so your
        team handles only high-value conversations. CrawlChat also logs
        conversations for quality reviews.
      </span>
    ),
  },
  {
    question:
      "What is the difference between ticket bot discord and discord chatbot?",
    answer: (
      <span>
        Ticket bot workflows focus on triage and escalation, while a Discord
        chatbot focuses on direct question answering. CrawlChat supports both
        patterns using one documentation knowledge base. Setup details are also
        covered on{" "}
        <a href="/discord-bot" className="link link-primary link-hover">
          Discord bot
        </a>
        .
      </span>
    ),
  },
  {
    question: "How do we start Discord community automation quickly?",
    answer: (
      <span>
        Connect your docs sources, add the bot to your server, and configure
        channel rules. You can begin with{" "}
        <a href="/pricing" className="link link-primary link-hover">
          a free trial
        </a>{" "}
        and iterate using analytics. For non-Discord channels, see{" "}
        <a
          href="/use-case/community-support"
          className="link link-primary link-hover"
        >
          community support
        </a>
        .
      </span>
    ),
  },
];
