import { Container } from "./layout";
import { prisma } from "libs/prisma";
import Markdown from "react-markdown";
import type { Route } from "./+types/article";
import { TbArrowLeft } from "react-icons/tb";
import { Link } from "react-router";
import cn from "@meltdownjs/cn";

export async function loader({ params }: Route.LoaderArgs) {
  const article = await prisma.article.findFirstOrThrow({
    where: {
      id: params.id,
    },
  });

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: {
      id: article.scrapeId,
    },
  });

  return { article, slug: scrape.slug };
}

export default function Article({ loaderData }: Route.ComponentProps) {
  return (
    <Container>
      <Link
        to={`/helpdesk/${loaderData.slug}`}
        className={cn(
          "link link-hover flex items-center gap-2 mb-4",
          "text-base-content/50 hover:text-base-content transition-colors"
        )}
      >
        <TbArrowLeft /> Back to helpdesk
      </Link>
      <h1 className="text-2xl font-bold mb-4">{loaderData.article.title}</h1>
      <div className="prose dark:prose-invert max-w-3xl">
        <Markdown>{loaderData.article.content}</Markdown>
      </div>
    </Container>
  );
}
