import { marked } from "marked";
import { LandingPage } from "../page";
import { Container } from "../page";
import fs from "fs";
import path from "path";
import { makeMeta } from "~/meta";
import type { Route } from "./+types/page";

export function meta() {
  return makeMeta({
    title: "Data Privacy - CrawlChat",
  });
}

export async function loader() {
  const htmlContent = await marked.parse(
    fs.readFileSync(
      path.join(process.cwd(), "app/landing/data-privacy/content.md"),
      "utf8"
    )
  );

  return { htmlContent };
}

export default function DataPrivacy({ loaderData }: Route.ComponentProps) {
  return (
    <LandingPage>
      <div className="flex flex-col py-12">
        <Container>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: loaderData.htmlContent }}
          />
        </Container>
      </div>
    </LandingPage>
  );
}
