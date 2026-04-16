import { SiDocusaurus, SiLinear } from "react-icons/si";
import {
  TbBrandDiscord,
  TbBrandGithub,
  TbBrandSlack,
  TbChartBar,
  TbCheck,
  TbClock,
  TbLink,
  TbMessagePlus,
  TbMessages,
  TbRobotFace,
  TbSettings,
  TbUpload,
  TbWorld,
} from "react-icons/tb";
import { MCPIcon } from "~/components/mcp-icon";
import { makeMeta } from "~/meta";
import { Container, HeadingHighlight } from "../page";
import {
  Channels,
  Connectors,
  UseCaseFaqSection,
  UseCaseHero,
  UseCaseIssues,
} from "./component";
import { customerSupportAutomationFaqs } from "./seo-data";

export function meta() {
  return makeMeta({
    title: "Customer Support Automation and Ticket Deflection - CrawlChat",
    description:
      "Use customer support automation, help desk automation, and ticket deflection workflows with source-linked answers from your docs.",
  });
}

export default function CustomerSupportAutomation() {
  return (
    <>
      <Container>
        <UseCaseHero
          title={
            <>
              <span className="text-primary">Customer support automation</span>{" "}
              for docs and support teams
            </>
          }
          description="Turn your documentation into a support chatbot that gives instant, source-linked answers. Reduce repetitive tickets, improve self service support, and let your team focus on complex customer issues."
        />
      </Container>

      <Container>
        <UseCaseIssues
          issues={[
            {
              question: "How can we reduce repetitive support tickets from docs?",
              shortAnswer: "Use a customer support chatbot trained on your docs",
              answer:
                "CrawlChat builds a documentation-first support chatbot from your existing help center and product docs. Customers get fast, grounded answers before opening tickets, which helps your team improve ticket deflection without sacrificing answer quality.",
              image: "/use-case/chat-widget.png",
              features: [
                {
                  icon: <TbRobotFace />,
                  text: "Customer support chatbot",
                },
                {
                  icon: <TbWorld />,
                  text: "Help center chatbot",
                },
                {
                  icon: <TbLink />,
                  text: "Source linked answers",
                },
              ],
            },
            {
              question: "What is ticket deflection and how do we measure it?",
              shortAnswer: "Track ticket deflection with conversation analytics",
              answer:
                "Ticket deflection means resolving user questions before they become support tickets. CrawlChat gives visibility into conversations, categories, confidence, and unresolved questions, so support teams can monitor deflection trends and continuously improve documentation coverage.",
              image: "/use-case/messages.png",
              features: [
                {
                  icon: <TbMessages />,
                  text: "Conversation logs",
                },
                {
                  icon: <TbChartBar />,
                  text: "Deflection analytics",
                },
                {
                  icon: <TbMessagePlus />,
                  text: "Improve missed answers",
                },
              ],
            },
            {
              question: "Can we provide always-on self service support globally?",
              shortAnswer: "Automated customer support with 24/7 coverage",
              answer:
                "Automated customer support helps users find answers immediately, even outside your team’s working hours. CrawlChat supports multilingual responses and adapts answer style to your support voice, improving self service support across regions and time zones.",
              image: "/use-case/group-types.png",
              features: [
                {
                  icon: <TbClock />,
                  text: "24/7 availability",
                },
                {
                  icon: <TbSettings />,
                  text: "Custom response tone",
                },
                {
                  icon: <TbCheck />,
                  text: "Multilingual support",
                },
              ],
            },
          ]}
        />
      </Container>

      <Container>
        <Connectors
          connectors={[
            {
              icon: <TbWorld />,
              title: "Web docs",
              tooltip: "Sync website and help center documentation",
            },
            {
              icon: <SiDocusaurus />,
              title: "Docusaurus",
              tooltip: "Import Docusaurus documentation instantly",
            },
            {
              icon: <TbBrandGithub />,
              title: "Issues",
              tooltip: "Use recurring issue answers in your support knowledge base",
            },
            {
              icon: <SiLinear />,
              title: "Linear",
              tooltip: "Add product and release context from Linear",
            },
            {
              icon: <TbUpload />,
              title: "Files",
              tooltip: "Upload SOPs, guides, and support playbooks",
            },
          ]}
          title={
            <>
              Build your <HeadingHighlight>support knowledge base</HeadingHighlight>{" "}
              from existing docs
            </>
          }
          description="Connect your documentation stack in minutes. CrawlChat unifies support docs, product docs, and issue history into one answer layer for customer support automation."
        />
      </Container>

      <Container>
        <Channels
          channels={[
            {
              icon: <TbWorld />,
              title: "Web widget",
              tooltip: "Embed support automation on docs and help center pages",
            },
            {
              icon: <TbBrandSlack />,
              title: "Slack",
              tooltip: "Give internal support teams instant product context",
            },
            {
              icon: <TbBrandDiscord />,
              title: "Discord",
              tooltip: "Answer community support questions instantly",
            },
            {
              icon: <MCPIcon />,
              title: "MCP",
              tooltip: "Expose docs to AI tools and assistants",
            },
          ]}
          title={
            <>
              Deliver support automation across every{" "}
              <HeadingHighlight>support channel</HeadingHighlight>
            </>
          }
          description="Meet users where they ask questions and route fewer issues to human support. CrawlChat keeps answers consistent across web, community, and internal channels."
        />
      </Container>

      <Container>
        <UseCaseFaqSection items={customerSupportAutomationFaqs} />
      </Container>
    </>
  );
}
