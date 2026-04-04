import cn from "@meltdownjs/cn";
import { BsClaude, BsPerplexity } from "react-icons/bs";
import { RiGeminiLine } from "react-icons/ri";
import { TbBrandOpenai } from "react-icons/tb";
import { makeMeta } from "~/meta";
import { Container } from "../page";
import type { Route } from "./+types/page";
import {
  chatbase,
  crawlchat,
  docsbot,
  featureNames,
  kapaai,
  mava,
  sitegpt,
  type FeatureName,
} from "./comparison";
import { CompareTable, type Comparison } from "./table";

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  const [, , product] = slug?.split("-") ?? [];

  if (!product) {
    throw new Error("Product not found");
  }

  const comparison: Comparison<FeatureName> = [crawlchat];
  if (product === "kapaai") {
    comparison.push(kapaai);
  } else if (product === "docsbot") {
    comparison.push(docsbot);
  } else if (product === "sitegpt") {
    comparison.push(sitegpt);
  } else if (product === "chatbase") {
    comparison.push(chatbase);
  } else if (product === "mava") {
    comparison.push(mava);
  }

  return {
    slug: params.slug,
    comparison,
  };
}

export function meta({ loaderData }: Route.ComponentProps) {
  return makeMeta({
    title: `CrawlChat vs ${loaderData.comparison[1].name}`,
  });
}

export default function ComparePage({ loaderData }: Route.ComponentProps) {
  const crawlchat = loaderData.comparison[0];
  const competitor = loaderData.comparison[1];
  const aiQuestion = encodeURIComponent(
    `Compare ${crawlchat.name} (${crawlchat.url}) and ${competitor.name} (${competitor.url}) in detail for technical documentation`
  );

  return (
    <div className="flex flex-col gap-16 mt-16">
      <Container>
        <h1 className="text-4xl font-brand text-center">
          CrawlChat vs {competitor.name}
        </h1>

        <p className="text-center text-base-content/50 mt-8">
          Compare the features of CrawlChat and {competitor.name} to see which
          one is the best for your needs.
        </p>
      </Container>

      <Container>
        <CompareTable
          names={featureNames}
          comparison={loaderData.comparison}
          size="xl"
        />
      </Container>

      <Container>
        <div
          className={cn(
            "flex flex-col md:flex-row items-center",
            "justify-center gap-4"
          )}
        >
          <span>Still not sure? Ask</span>
          <div className="flex items-center justify-center gap-4">
            <a
              target="_blank"
              href={`https://chatgpt.com/?q=${aiQuestion}`}
              className="tooltip"
              data-tip="Ask ChatGPT"
            >
              <TbBrandOpenai size={32} />
            </a>
            <a
              target="_blank"
              href={`https://claude.ai/?q=${aiQuestion}`}
              className="tooltip"
              data-tip="Ask Claude"
            >
              <BsClaude size={32} />
            </a>
            <a
              target="_blank"
              href={`https://www.google.com/search?udm=50&q=${aiQuestion}`}
              className="tooltip"
              data-tip="Ask Gemini"
            >
              <RiGeminiLine size={32} />
            </a>
            <a
              target="_blank"
              href={`https://www.perplexity.ai/?q=${aiQuestion}`}
              className="tooltip"
              data-tip="Ask Perplexity"
            >
              <BsPerplexity size={32} />
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
