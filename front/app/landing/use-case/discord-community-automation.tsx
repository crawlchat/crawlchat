import { SiLinear } from "react-icons/si";
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
import { makeMeta } from "~/meta";
import { Container, HeadingHighlight } from "../page";
import {
  Channels,
  Connectors,
  UseCaseFaqSection,
  UseCaseHero,
  UseCaseIssues,
} from "./component";
import { discordCommunityAutomationFaqs } from "./seo-data";

export function meta() {
  return makeMeta({
    title: "Discord Ticket Bot and Community Automation - CrawlChat",
    description:
      "Automate Discord community support with a Discord ticket bot, moderation bot workflows, and documentation-first chatbot answers.",
  });
}

export default function DiscordCommunityAutomation() {
  return (
    <>
      <Container>
        <UseCaseHero
          title={
            <>
              <span className="text-primary">Discord ticket bot</span> for
              community automation
            </>
          }
          description="Run Discord community support on autopilot with documentation-first answers. Help users instantly, reduce repetitive moderator work, and keep conversations accurate with source-linked replies."
        />
      </Container>

      <Container>
        <UseCaseIssues
          issues={[
            {
              question:
                "How do we answer repeated Discord support questions fast?",
              shortAnswer: "Add a Discord support bot connected to your docs",
              answer:
                "CrawlChat turns your docs into a Discord support bot so members can ask questions by tagging the bot. It responds in seconds with grounded answers and links to the original documentation, reducing repetitive moderator replies.",
              image: "/use-case/discord.png",
              features: [
                {
                  icon: <TbBrandDiscord />,
                  text: "Discord support bot",
                },
                {
                  icon: <TbLink />,
                  text: "Source citations",
                },
                {
                  icon: <TbClock />,
                  text: "24/7 support",
                },
              ],
            },
            {
              question:
                "Can a Discord ticket bot automate community workflows?",
              shortAnswer: "Automate triage and improve ticket quality",
              answer:
                "Use Discord community automation to guide users toward documented answers before escalation. When escalation is needed, CrawlChat supports structured handoff flows so moderators receive better context and can resolve issues faster.",
              image: "/use-case/chat-widget.png",
              features: [
                {
                  icon: <TbRobotFace />,
                  text: "Discord ticket bot",
                },
                {
                  icon: <TbSettings />,
                  text: "Custom workflows",
                },
                {
                  icon: <TbCheck />,
                  text: "Fewer repeated tickets",
                },
              ],
            },
            {
              question:
                "How do we improve moderation and response quality over time?",
              shortAnswer: "Use analytics and moderator feedback loops",
              answer:
                "CrawlChat logs conversations, ratings, and unresolved questions so your team can improve response quality continuously. Moderators can refine answers directly from real community context and build better Discord community management playbooks.",
              image: "/use-case/messages.png",
              features: [
                {
                  icon: <TbMessages />,
                  text: "Conversation insights",
                },
                {
                  icon: <TbChartBar />,
                  text: "Performance analytics",
                },
                {
                  icon: <TbMessagePlus />,
                  text: "Moderator feedback loop",
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
              tooltip: "Sync product docs and help center content",
            },
            {
              icon: <TbBrandGithub />,
              title: "Issues",
              tooltip: "Use solved issue context in Discord answers",
            },
            {
              icon: <SiLinear />,
              title: "Linear",
              tooltip: "Include roadmap and release context",
            },
            {
              icon: <TbUpload />,
              title: "Files",
              tooltip: "Add runbooks and moderation guidelines",
            },
          ]}
          title={
            <>
              Connect the knowledge your{" "}
              <HeadingHighlight>Discord chatbot</HeadingHighlight> needs
            </>
          }
          description="Bring docs, issue history, and internal guides into one knowledge base so your Discord chatbot can answer with better context."
        />
      </Container>

      <Container>
        <Channels
          channels={[
            {
              icon: <TbBrandDiscord />,
              title: "Discord",
              tooltip:
                "Automate community support directly in Discord channels",
            },
            {
              icon: <TbBrandSlack />,
              title: "Slack",
              tooltip: "Align internal support and community support responses",
            },
            {
              icon: <TbWorld />,
              title: "Web widget",
              tooltip: "Reuse the same knowledge base on your docs website",
            },
          ]}
          title={
            <>
              Keep automation consistent across{" "}
              <HeadingHighlight>community channels</HeadingHighlight>
            </>
          }
          description="Use one support knowledge base for Discord, web, and internal channels so every customer gets consistent, accurate answers."
        />
      </Container>

      <Container>
        <UseCaseFaqSection items={discordCommunityAutomationFaqs} />
      </Container>
    </>
  );
}
