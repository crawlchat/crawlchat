import { Stack } from "@chakra-ui/react";
import { TbPointer } from "react-icons/tb";
import { Page } from "~/components/page";
import { EditForm } from "./edit-form";
import { EditActionProvider } from "./use-edit-action";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "libs/prisma";
import type { Route } from "./+types/new";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { useFetcher } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const data = JSON.parse(formData.get("data") as string);

  console.log(data);

  const action = await prisma.apiAction.create({
    data: {
      scrapeId,
      userId: user!.id,
      title: data.title,
      url: data.url,
      method: data.method,
      data: data.data,
      headers: data.headers,
    },
  });

  return { action };
}

export default function NewAction() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post">
      <EditActionProvider>
        <Page title="New Action" icon={<TbPointer />}>
          <Stack>
            <EditForm />
          </Stack>
        </Page>
      </EditActionProvider>
    </fetcher.Form>
  );
}
