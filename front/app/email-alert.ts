import { prisma } from "libs/prisma";
import type { Route } from "./+types/email-alert";
import { getJwtAuthUser } from "./jwt";
import { authoriseScrapeUser } from "./scrapes/util";
import { sendLowCreditsEmail } from "./email";

export async function action({ request }: Route.LoaderArgs) {
  const user = await getJwtAuthUser(request);

  const body = await request.json();
  const intent = body.intent;

  if (intent === "low-credits") {
    const scrape = await prisma.scrape.findFirstOrThrow({
      where: { id: body.scrapeId },
      include: {
        user: true,
        scrapeUsers: {
          include: {
            user: true,
          },
        },
      },
    });
    authoriseScrapeUser(user!.scrapeUsers, scrape.id);

    if (!scrape.user.plan?.credits) return;

    const credits =
      scrape.user.plan?.credits[
        body.creditType as keyof typeof scrape.user.plan.credits
      ] ?? 0;
    for (const scrapeUser of scrape.scrapeUsers) {
      if (scrapeUser.user) {
        await sendLowCreditsEmail(
          scrapeUser.user.email!,
          scrape.title ?? "",
          scrapeUser.user.name ?? "",
          body.creditType,
          credits
        );
      }
    }
  }

  return Response.json({ success: true });
}
