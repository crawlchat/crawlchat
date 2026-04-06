import { prisma } from "@packages/common/prisma";
import { TbPlayerPlay, TbPointer } from "react-icons/tb";
import { redirect, useFetcher } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import { showModal } from "~/components/daisy-utils";
import { Page } from "~/components/page";
import { makeMeta } from "~/meta";
import type { Route } from "./+types/edit";
import { EditForm } from "./edit-form";
import { SaveForm } from "./save-form";
import { ApiActionTestModal } from "./test-modal";
import { EditActionProvider } from "./use-edit-action";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const action = await prisma.apiAction.findUnique({
    where: {
      id: params.actionId,
      scrapeId,
    },
  });

  return { action };
}

export function meta({ data }: Route.MetaArgs) {
  return makeMeta({
    title: `${data.action?.title ?? "Untitled"} - CrawlChat`,
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "update") {
    const data = JSON.parse(formData.get("data") as string);

    const action = await prisma.apiAction.update({
      where: {
        id: params.actionId,
        scrapeId,
      },
      data: {
        scrapeId,
        userId: user!.id,
        title: data.title,
        url: data.url,
        method: data.method,
        data: data.data,
        headers: data.headers,
        description: data.description,
        type: "custom",
        requireEmailVerification: data.requireEmailVerification,
      },
    });

    return { action };
  }

  if (intent === "delete") {
    await prisma.apiAction.delete({
      where: {
        id: params.actionId,
        scrapeId,
      },
    });

    throw redirect(`/actions`);
  }

  if (intent === "test") {
    const {
      url,
      method,
      data,
      headers: inputHeaders,
    } = JSON.parse(formData.get("payload") as string);
    let error = null;
    let status = -1;
    let text = "";
    try {
      let params = "";
      if (method === "get") {
        params = "?" + new URLSearchParams(data).toString();
      }

      let body: string | undefined;
      if (method === "post" || method === "delete" || method === "put") {
        body = JSON.stringify(data);
      }

      let headers: Record<string, any> | undefined;
      if (method === "post" || method === "delete" || method === "put") {
        headers = {
          "content-type": "application/json",
          ...inputHeaders,
        };
      }

      const response = await fetch(url + params, {
        method,
        headers,
        body,
      });

      status = response.status;
      text = await response.text();
    } catch (e: any) {
      error = e.toString();
    }

    return {
      status,
      text,
      error,
    };
  }
}

export default function EditAction({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();

  if (!loaderData.action) return;

  return (
    <EditActionProvider initAction={loaderData.action}>
      <Page
        title="Edit action"
        icon={<TbPointer />}
        right={
          <>
            <div className="tooltip tooltip-left" data-tip="Test the API">
              <button
                className="btn btn-square btn-accent btn-soft"
                onClick={() => showModal("api-action-test-modal")}
              >
                <TbPlayerPlay />
              </button>
            </div>
            <SaveForm fetcher={fetcher} deleteFetcher={deleteFetcher} />
          </>
        }
      >
        <EditForm />

        <ApiActionTestModal />
      </Page>
    </EditActionProvider>
  );
}
