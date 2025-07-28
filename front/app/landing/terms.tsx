import { marked } from "marked";
import fs from "fs";
import path from "path";
import type { Route } from "./+types/terms";
import { Prose } from "~/components/ui/prose";
import { LandingPage } from "./page";
import { Stack } from "@chakra-ui/react";
import { Container } from "./page";

export function meta() {
  return [
    {
      title: "Terms of Service - CrawlChat",
    },
  ];
}

export async function loader() {
  const htmlContent = await marked.parse(
    fs.readFileSync(path.join(process.cwd(), "app/landing/terms.md"), "utf8")
  );

  return { htmlContent };
}

export default function Terms({ loaderData }: Route.ComponentProps) {
  return (
    <LandingPage>
      <Stack py={12}>
        <Container>
          <Prose
            dangerouslySetInnerHTML={{ __html: loaderData.htmlContent }}
            size={"lg"}
            maxW={"100%"}
          />
        </Container>
      </Stack>
    </LandingPage>
  );
}
