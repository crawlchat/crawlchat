import { prisma } from "libs/prisma";
import type { Route } from "./+types/button-page";
import { AskAIButton } from "./ask-ai-button";

export async function loader({ params }: Route.LoaderArgs) {
  const scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: params.id },
  });

  return { scrape };
}

export default function ButtonPage({ loaderData }: Route.ComponentProps) {
  return <AskAIButton scrape={loaderData.scrape} />;
}
