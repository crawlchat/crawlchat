import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import type { Route } from "./+types/test";

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

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
      let headers: Record<string, any> | undefined = { ...inputHeaders };

      if (method === "post" || method === "delete" || method === "put") {
        body = JSON.stringify(data);
        headers = {
          "content-type": "application/json",
          ...headers,
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

export default function ApiActionTest() {
  return <div>Test ApiAction</div>;
}
