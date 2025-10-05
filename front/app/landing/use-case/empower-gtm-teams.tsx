import { Container, HeadingHighlight } from "../page";
import {
  TbAi,
  TbBrain,
  TbBrandDiscord,
  TbBrandNotion,
  TbBrandSlack,
  TbCheck,
  TbDatabase,
  TbLink,
  TbLock,
  TbRefresh,
  TbRobotFace,
  TbUpload,
} from "react-icons/tb";
import { makeMeta } from "~/meta";
import { Channels, Connectors, UseCaseHero, UseCaseIssues } from "./component";
import { SiConfluence, SiLinear } from "react-icons/si";

export function meta() {
  return makeMeta({
    title: "Empower GTM teams - CrawlChat",
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
              Make your <span className="text-primary">GTM teams</span> to have
              full <span className="text-primary">context</span> about your
              product
            </>
          }
          description="GTM teams need to know everything about your product to be able to take your product to market with better positioning, communication and drive better growth. CrawlChat lets your GTM teams ask any question about your product so that they plan better strategies."
        />
      </Container>

      <Container>
        <UseCaseIssues
          issues={[
            {
              question:
                "There are so many teams with their own docs, how to have a centralized knowledge base?",
              shortAnswer: "Make a unified knowledge base for your product",
              answer:
                "Often times the teams of your company have their own docs and knowledge base. It is very hard for teams like marketing, sales, support, etc. that are part of the GTM, to have up to date information about your product. CrawlChat makes sure your any team can ask any question about your product and it answers it instantly referring docs from all the teams.",
              image: "/use-case/group-types.png",
              features: [
                {
                  icon: <TbDatabase />,
                  text: "Centralized knowledge base",
                },
                {
                  icon: <TbLink />,
                  text: "Links to your docs",
                },
              ],
            },
            {
              question: "How to make sure that the docs are internal?",
              shortAnswer: "Make private answering assistant",
              answer:
                "CrawlChat lets you make the chat assistant purely private. That means, you can connect the docs that are hosted on private content systems and integrate the assistant only on private channels such as Slack, Discord or private links. The docs are securely stored on CrawlChat's servers and shared with LLMs while answering the questions. You can also configure auto sync of the docs so that the assistant is always up to date.",
              image: "/use-case/visibility-type.png",
              features: [
                {
                  icon: <TbLock />,
                  text: "Private assistant",
                },
                {
                  icon: <TbRefresh />,
                  text: "Auto sync",
                },
                {
                  icon: <TbRobotFace />,
                  text: "Discord & Slack bots",
                },
              ],
            },
            {
              question: "But how to get well researched answers?",
              shortAnswer: "Best LLMs to research and answer the questions",
              answer:
                "It is known that the docs collected from different teams would be very complicated and should be well researched before answering the questions. CrawlChat uses the best LLMs to research and answer the questions. It uses the best LLMs from OpenAI, Anthropic, Google, and Gemini to answer the questions and also follows best practices in the RAG process to make sure that the LLMs refer the documents accurately.",
              image: "/use-case/llm-models.png",
              features: [
                {
                  icon: <TbAi />,
                  text: "Best LLMs",
                },
                {
                  icon: <TbBrain />,
                  text: "Customise",
                },
                {
                  icon: <TbCheck />,
                  text: "Best RAG process",
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
              icon: <TbBrandNotion />,
              title: "Notion",
              tooltip: "Add Notion pages to the knowledge base",
            },
            {
              icon: <SiConfluence />,
              title: "Confluence",
              tooltip: "Add Confluence pages to the knowledge base",
            },
            {
              icon: <SiLinear />,
              title: "Linear",
              tooltip: "Add Linear issues and projects to the knowledge base",
            },
            {
              icon: <TbUpload />,
              title: "Files",
              tooltip: "Upload files to the knowledge base",
            },
          ]}
          title={
            <>
              Connect your <HeadingHighlight>internal docs</HeadingHighlight>
            </>
          }
          description="CrawlChat respects the privacy of your internal docs and provides you the connectors to add the docs directly to the knowledge base. Following are the connectors that you can use to add your internal docs to the knowledge base."
        />
      </Container>

      <Container>
        <Channels
          channels={[
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
              icon: <TbLink />,
              title: "Private links",
              tooltip: "Access the chat assistant on private links",
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
