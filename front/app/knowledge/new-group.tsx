import {
  Input,
  Stack,
  Group,
  RadioCard,
  HStack,
  Icon,
  Checkbox,
  Text,
} from "@chakra-ui/react";
import { TbBook2, TbBrandGithub, TbCheck, TbWorld } from "react-icons/tb";
import { SiDocusaurus } from "react-icons/si";
import { redirect, useFetcher } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { createToken } from "~/jwt";
import type { Route } from "./+types/new-group";
import { useMemo, useState } from "react";
import { prisma } from "~/prisma";
import { getSessionScrapeId } from "~/scrapes/util";
import type { KnowledgeGroupType } from "libs/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapes = await prisma.scrape.findMany({
    where: {
      userId: user!.id,
    },
  });

  return {
    token: createToken(user!.id),
    scrapes,
  };
}

export async function action({ request }: { request: Request }) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUniqueOrThrow({
    where: { id: scrapeId as string, userId: user!.id },
  });

  const formData = await request.formData();

  if (request.method === "POST") {
    let url = formData.get("url") as string;
    let maxLinks = formData.get("maxLinks");
    let allowOnlyRegex = formData.get("allowOnlyRegex");
    let removeHtmlTags = formData.get("removeHtmlTags");
    let skipPageRegex = formData.get("skipPageRegex") as string;
    let subType = formData.get("subType") as string;

    let type = formData.get("type") as string;
    let githubRepoUrl = formData.get("githubRepoUrl");
    let githubBranch = formData.get("githubBranch");
    let prefix = formData.get("prefix");
    let title = formData.get("title") as string;

    if (type === "scrape_github") {
      if (!githubRepoUrl) {
        return { error: "GitHub Repo URL is required" };
      }

      if (!githubBranch) {
        return { error: "Branch name is required" };
      }

      url = `${githubRepoUrl}/tree/${githubBranch}`;
      allowOnlyRegex = "https://github.com/[^/]+/[^/]+/(tree|blob)/main.*";
      const removeSelectors = [".react-line-number", "#repos-file-tree"];
      removeHtmlTags = removeSelectors.join(",");
      maxLinks = "100";
    }

    if (type === "github_issues") {
      url = githubRepoUrl as string;
    }

    if (!url) {
      return { error: "URL is required" };
    }

    if (prefix === "on") {
      allowOnlyRegex = `^${url.replace(/\/$/, "")}.*`;
    }

    if (type === "docusaurus") {
      type = "scrape_web";
    }

    if (formData.has("versionsToSkip")) {
      const value = formData.get("versionsToSkip") as string;
      skipPageRegex += `,${value
        .split(",")
        .map((v) => v.trim())
        .map((v) => "/docs/" + v)
        .join(",")}`;
    }

    const group = await prisma.knowledgeGroup.create({
      data: {
        scrapeId: scrape.id,
        userId: user!.id,
        type: type as KnowledgeGroupType,
        status: "pending",

        title,

        url,
        matchPrefix: prefix === "on",
        removeHtmlTags: removeHtmlTags as string,
        maxPages: 5000,
        staticContentThresholdLength: 100,

        skipPageRegex,
        subType,

        githubBranch: githubBranch as string,
        githubUrl: githubRepoUrl as string,
      },
    });

    throw redirect(`/knowledge/group/${group.id}`);
  }
}

export default function NewScrape({ loaderData }: Route.ComponentProps) {
  const scrapeFetcher = useFetcher();

  const types = useMemo(
    function () {
      return [
        {
          title: "Web",
          value: "scrape_web",
          description: "Scrape a website",
          icon: <TbWorld />,
          longDescription:
            "Scrapes the provided URL and children links it finds and turns them into the knowledge. It can also fetch dynamic content (Javascript based).",
        },
        {
          title: "Docusaurus based",
          value: "docusaurus",
          description: "Fetch Docusaurus based docs",
          icon: <SiDocusaurus />,
          longDescription:
            "Scrapes the Docusaurus based docs from the provided URL and turns them into the knowledge. It sets all required settings tailored for Docusaurus.",
        },
        {
          title: "GitHub Repo",
          value: "scrape_github",
          description: "Scrape a GitHub repository",
          icon: <TbBrandGithub />,
          longDescription:
            "Scrapes the provided GitHub repository, reads the code from all the files and turns them into the knowledge.",
        },
        {
          title: "GitHub Issues",
          value: "github_issues",
          description: "Fetch GitHub issues",
          icon: <TbBrandGithub />,
          longDescription:
            "Fetch GitHub issues from the provided repository and turns them into the knowledge. The repository must be public (for now).",
        },
      ];
    },
    [loaderData.scrapes]
  );
  const [type, setType] = useState<string>("scrape_web");

  function getDescription(type: string) {
    return types.find((t) => t.value === type)?.longDescription;
  }

  return (
    <Page title="New knowledge group" icon={<TbBook2 />}>
      <Stack maxW={"800px"} w={"full"}>
        <scrapeFetcher.Form method="post">
          <Stack gap={4}>
            <RadioCard.Root
              name="type"
              value={type}
              onValueChange={(value) =>
                setType(value.value as KnowledgeGroupType)
              }
            >
              <HStack align="stretch">
                {types.map((item) => (
                  <RadioCard.Item key={item.value} value={item.value}>
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl>
                      <RadioCard.ItemContent>
                        <Icon fontSize="2xl" color="fg.muted" mb="2">
                          {item.icon}
                        </Icon>
                        <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                        <RadioCard.ItemDescription>
                          {item.description}
                        </RadioCard.ItemDescription>
                      </RadioCard.ItemContent>
                      <RadioCard.ItemIndicator />
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </HStack>
            </RadioCard.Root>

            <Text opacity={0.5}>{getDescription(type)}</Text>

            <Field label="Name" required>
              <Input
                required
                placeholder="Ex: Documentation"
                name="title"
                disabled={scrapeFetcher.state !== "idle"}
              />
            </Field>

            {type === "scrape_web" && (
              <>
                <Field label="URL" required>
                  <Input
                    required
                    pattern="^https://[^/]+"
                    placeholder="https://example.com"
                    name="url"
                    disabled={scrapeFetcher.state !== "idle"}
                  />
                </Field>

                <Checkbox.Root name="prefix" defaultChecked>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>Match exact prefix</Checkbox.Label>
                </Checkbox.Root>
              </>
            )}

            {type === "docusaurus" && (
              <>
                <Field label="Docs URL" required>
                  <Input
                    required
                    pattern="^https://[^/]+"
                    placeholder="https://example.com/docs"
                    name="url"
                    disabled={scrapeFetcher.state !== "idle"}
                  />
                </Field>
                <Field label="Versions to skip">
                  <Input
                    placeholder="Ex: 1.0.0, 1.1.0, 2.x"
                    name="versionsToSkip"
                    disabled={scrapeFetcher.state !== "idle"}
                  />
                </Field>
                <input
                  type="hidden"
                  name="removeHtmlTags"
                  value="nav,aside,footer,header,.theme-announcement-bar"
                />
                <input type="hidden" name="prefix" value="on" />
                <input
                  type="hidden"
                  name="skipPageRegex"
                  value="/docs/[0-9x]+\.[0-9x]+\.[0-9x]+,/docs/next"
                />
                <input type="hidden" name="subType" value="docusaurus" />
              </>
            )}

            {type === "scrape_github" && (
              <>
                <Group gap={4}>
                  <Field label="GitHub Repo URL" required>
                    <Input
                      name="githubRepoUrl"
                      placeholder="https://github.com/user/repo"
                    />
                  </Field>

                  <Field label="Branch name" required defaultValue={"main"}>
                    <Input name="githubBranch" placeholder="main" />
                  </Field>
                </Group>
              </>
            )}

            {type === "github_issues" && (
              <>
                <Field label="GitHub Repo URL" required>
                  <Input
                    name="githubRepoUrl"
                    placeholder="https://github.com/user/repo"
                  />
                </Field>
              </>
            )}

            <Group justifyContent={"flex-end"}>
              <Button
                type="submit"
                loading={scrapeFetcher.state !== "idle"}
                colorPalette={"brand"}
              >
                Create
                <TbCheck />
              </Button>
            </Group>
          </Stack>
        </scrapeFetcher.Form>
      </Stack>
    </Page>
  );
}
