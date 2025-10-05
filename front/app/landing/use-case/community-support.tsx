import { Container, HeadingHighlight } from "../page";
import {
  TbBrandDiscord,
  TbBrandGithub,
  TbBrandSlack,
  TbChartBar,
  TbCheck,
  TbClock,
  TbLanguage,
  TbLink,
  TbMessagePlus,
  TbMessages,
  TbSettings,
  TbUpload,
  TbWorld,
} from "react-icons/tb";
import { makeMeta } from "~/meta";
import { Channels, Connectors, UseCaseHero, UseCaseIssues } from "./component";
import { SiDocusaurus, SiLinear } from "react-icons/si";
import { MCPIcon } from "~/mcp-icon";

export function meta() {
  return makeMeta({
    title: "Community support - CrawlChat",
    description: "Make your technical docs answer the queries instantly!",
  });
}

export default function CommunitySupport() {
  return (
    <>
      <Container>
        <UseCaseHero
          title={
            <>
              <span className="text-primary">Reduce your tech queries</span>{" "}
              from your SaaS community
            </>
          }
          description="Most of the queries asked by your community members are already answered in your documentation. With CrawlChat, you can make your documentation answer the queries instantly on the platforms where your community is."
        />
      </Container>

      <Container>
        <UseCaseIssues
          issues={[
            {
              question:
                "Why people are unable to find the answers from the docs website?",
              shortAnswer: "Embed the answering agent on your website",
              answer:
                "The way people read the docs is changing. It is required to provide an easy way to get the answers from the docs. Text based search is not enough anymore. So, CrawlChat provides you a chat widget that you can embed on your website so that your community can get the answers from the docs website. It also provides the links to the docs that it uses to answer the questions.",
              image: "/use-case/chat-widget.png",
              features: [
                {
                  icon: <TbWorld />,
                  text: "Embed on web",
                },
                {
                  icon: <TbSettings />,
                  text: "Customise",
                },
                {
                  icon: <TbLink />,
                  text: "Links to your docs",
                },
              ],
            },
            {
              question:
                "Why do they keep asking the questions already answered in the docs?",
              shortAnswer: "Answers queries from your docs",
              answer:
                "CrawlChat makes the knowledge base from your docs and uses it to answer the questions. So, your community members can get the answers they need without waiting for you to respond. This makes sure that your support team is not overwhelmed with queries.",
              image: "/use-case/group-types.png",
              features: [
                {
                  icon: <TbClock />,
                  text: "24/7 availability",
                },
                {
                  icon: <TbLanguage />,
                  text: "Multilingual",
                },
                {
                  icon: <TbCheck />,
                  text: "Your own docs",
                },
              ],
            },
            {
              question: "How do I set it up for my Discord server?",
              shortAnswer: "Add it as a Discord or Slack bot on your server",
              answer:
                "No worries, CrawlChat provides you a Discord bot and Slack bot that you can add to your server so that your community members can just tag the bot and ask the questions. The bot answers the questions in few seconds and provides the links to the docs that it uses to answer the questions.",
              image: "/use-case/discord.png",
              features: [
                {
                  icon: <TbBrandDiscord />,
                  text: "Discord bot",
                },
                {
                  icon: <TbBrandSlack />,
                  text: "Slack app",
                },
                {
                  icon: <TbLink />,
                  text: "Links to your docs",
                },
              ],
            },
            {
              question: "How do I make sure that the answers are correct?",
              shortAnswer: "Be on top of the answers and analytics",
              answer:
                "Once integrated, you can view all the conversations and answers from the dashboard. You can view the confidence score of each message and correct the answers if needed. You can also view the analytics to see how the chatbot is performing and improve your docs.",
              image: "/use-case/messages.png",
              features: [
                {
                  icon: <TbMessages />,
                  text: "View conversations",
                },
                {
                  icon: <TbChartBar />,
                  text: "Analytics",
                },
                {
                  icon: <TbMessagePlus />,
                  text: "Correct the answers",
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
              title: "Web",
              tooltip: "Scrapes any web based documentation",
            },
            {
              icon: <TbBrandGithub />,
              title: "Github issues",
              tooltip: "Add github issues to the knowledge base",
            },
            {
              icon: <SiDocusaurus />,
              title: "Docusaurus",
              tooltip: "Add any Docusaurus based documentation",
            },
            {
              icon: <TbUpload />,
              title: "Files",
              tooltip: "Upload files to the knowledge base",
            },
            {
              icon: <SiLinear />,
              title: "Linear",
              tooltip: "Add linear issues and projects to the knowledge base",
            },
          ]}
          title={
            <>
              Connect your <HeadingHighlight>docs instantly</HeadingHighlight>
            </>
          }
          description="It is required to add your docs to the knowledge base for the chat assistant to answer the questions. CrawlChat provides you a wide range of connectors using which you can instantly add your existing docs to the knowledge base."
        />
      </Container>

      <Container>
        <Channels
          channels={[
            {
              icon: <TbWorld />,
              title: "Web widget",
              tooltip: "Embed the chat assistant on your website",
            },
            {
              icon: <TbBrandDiscord />,
              title: "Discord",
              tooltip: "Embed the chat assistant on your Discord server",
            },
            {
              icon: <TbBrandSlack />,
              title: "Slack",
              tooltip: "Embed the chat assistant on your Slack workspace",
            },
            {
              icon: <MCPIcon />,
              title: "MCP",
              tooltip: "Provide your docs as an MCP server",
            },
          ]}
          title={
            <>
              Embed the chat assistant to your{" "}
              <HeadingHighlight>community</HeadingHighlight>
            </>
          }
          description="You can deliver your docs to your community where they are so that there is less friction in getting the answers. You can embed the chat assistant to your community on the following platforms."
        />
      </Container>
    </>
  );
}
