import type { ReactNode } from "react";
import {
  TbArrowRight,
  TbBrandDiscord,
  TbMessage,
  TbRobotFace,
} from "react-icons/tb";
import { makeMeta } from "~/meta";
import {
  Badge,
  Container,
  Heading,
  HeadingDescription,
  HeadingHighlight,
} from "../page";

type UseCaseCard = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const useCaseCards: UseCaseCard[] = [
  {
    title: "Community Support",
    description:
      "Deliver instant, source-linked answers from your docs with a documentation assistant and support chatbot on web, Discord, and Slack.",
    href: "/use-case/community-support",
    icon: <TbMessage />,
  },
  {
    title: "Internal Knowledge Base for GTM Teams",
    description:
      "Create a private internal knowledge base from internal documentation to support sales enablement and unified GTM product context.",
    href: "/use-case/empower-gtm-teams",
    icon: <TbRobotFace />,
  },
  {
    title: "Customer Support Automation",
    description:
      "Reduce repetitive tickets with customer support automation, help desk automation, and docs-first ticket deflection workflows.",
    href: "/use-case/customer-support-automation",
    icon: <TbMessage />,
  },
  {
    title: "Discord Community Automation",
    description:
      "Run Discord community support with a documentation-powered Discord ticket bot, moderation bot workflows, and customer support automation.",
    href: "/use-case/discord-community-automation",
    icon: <TbBrandDiscord />,
  },
];

export function meta() {
  return makeMeta({
    title: "CrawlChat Use Cases for Documentation AI",
    description:
      "Explore CrawlChat use cases for documentation assistant, customer support automation, internal knowledge base, and Discord ticket bot workflows.",
  });
}

export default function UseCaseIndexPage() {
  return (
    <Container>
      <div className="mt-16">
        <Badge>Use cases</Badge>
        <Heading>
          Explore CrawlChat <HeadingHighlight>use cases</HeadingHighlight>
        </Heading>
        <HeadingDescription>
          Find the right documentation AI workflow for your team, from customer
          support automation and ticket deflection to internal knowledge base
          and Discord community automation.
        </HeadingDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-8">
        {useCaseCards.map((useCase) => (
          <a
            key={useCase.href}
            href={useCase.href}
            className="rounded-box border border-base-300 p-6 flex flex-col gap-4 hover:border-primary transition-all"
          >
            <div className="text-2xl text-primary">{useCase.icon}</div>
            <h2 className="text-2xl font-brand">{useCase.title}</h2>
            <p className="text-base-content/70">{useCase.description}</p>
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              View use case
              <TbArrowRight />
            </span>
          </a>
        ))}
      </div>
    </Container>
  );
}
