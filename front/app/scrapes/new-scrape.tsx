import {
  Input,
  Stack,
  Group,
  Text,
  Badge,
  createListCollection,
  Center,
  Spinner,
} from "@chakra-ui/react";
import {
  TbArrowRight,
  TbCheck,
  TbCircleCheckFilled,
  TbInfoCircle,
  TbScan,
} from "react-icons/tb";
import { Link, redirect, useFetcher, useSearchParams } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import {
  NumberInputField,
  NumberInputRoot,
} from "~/components/ui/number-input";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "~/components/ui/select";
import { Tooltip } from "~/components/ui/tooltip";
import { useScrape } from "~/dashboard/use-scrape";
import { createToken } from "~/jwt";
import type { Route } from "./+types/new-scrape";
import { useEffect, useMemo, useState } from "react";
import { prisma } from "~/prisma";
import type { Scrape } from "libs/prisma";

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
  const formData = await request.formData();

  if (request.method === "POST") {
    let url = formData.get("url");
    let maxLinks = formData.get("maxLinks");
    let skipRegex = formData.get("skipRegex");
    let allowOnlyRegex = formData.get("allowOnlyRegex");
    let dynamicFallbackContentLength = formData.get(
      "dynamicFallbackContentLength"
    );
    let removeHtmlTags = formData.get("removeHtmlTags");
    let includeHtmlTags = formData.get("includeHtmlTags");
    let scrapeId = formData.get("scrapeId");
    let type = formData.get("type");
    let githubRepoUrl = formData.get("githubRepoUrl");
    let githubBranch = formData.get("githubBranch");  

    if (type === "github-repo") {
      if (!githubRepoUrl) {
        return { error: "GitHub Repo URL is required" };
      }

      if (!githubBranch) {
        return { error: "Branch name is required" };
      }

      url = `${githubRepoUrl}/tree/${githubBranch}`;
      allowOnlyRegex = "https:\/\/github.com\/[^\/]+\/[^\/]+\/(tree|blob)\/main.*";
      const removeSelectors = [
        ".react-line-number",
        "#repos-file-tree",
      ]
      removeHtmlTags = removeSelectors.join(",");
      maxLinks = "1000";
    }

    if (!url) {
      return { error: "URL is required" };
    }

    let scrape: Scrape;

    if (scrapeId === "new") {
      scrape = await prisma.scrape.create({
        data: {
          url: url as string,
          userId: user!.id,
          status: "pending",
          indexer: "mars",
        },
      });
    } else {
      scrape = await prisma.scrape.findUniqueOrThrow({
        where: { id: scrapeId as string },
      });
    }

    const token = createToken(user!.id);

    const response = await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "POST",
      body: JSON.stringify({
        maxLinks,
        skipRegex,
        allowOnlyRegex,
        scrapeId: scrape.id,
        dynamicFallbackContentLength,
        removeHtmlTags,
        includeHtmlTags,
        url: scrapeId !== "new" ? url : undefined,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 212) {
      const json = await response.json();
      throw redirect(`/threads/new?id=${json.scrapeId}`);
    }

    return { scrapeId: scrape.id };
  }
}

const maxLinks = createListCollection({
  items: [
    { label: "1 page", value: "1" },
    { label: "10 pages", value: "10" },
    { label: "50 pages", value: "50" },
    { label: "100 pages", value: "100" },
    { label: "300 pages", value: "300" },
    { label: "500 pages", value: "500" },
    { label: "1000 pages", value: "1000" },
  ],
});

export default function NewScrape({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const { connect, stage, scraping } = useScrape();
  const scrapeFetcher = useFetcher();
  const scrapesCollection = useMemo(
    function () {
      return createListCollection({
        items: [
          { title: "New collection", id: "new" },
          ...loaderData.scrapes,
        ].map((scrape) => ({
          label: scrape.title,
          value: scrape.id,
        })),
      });
    },
    [loaderData.scrapes]
  );

  const typeCollection = useMemo(
    function () {
      return createListCollection({
        items: [
          { label: "Web", value: "web" },
          { label: "GitHub Repo", value: "github-repo" },
        ],
      });
    },
    [loaderData.scrapes]
  );
  const [type, setType] = useState<string>("web");

  useEffect(() => {
    connect(loaderData.token);
  }, []);

  const loading =
    scrapeFetcher.state !== "idle" || ["scraping", "scraped"].includes(stage);

  return (
    <Page title="New Scrape" icon={<TbScan />}>
      <Center w="full" h="full">
        <Stack maxW={"500px"} w={"full"}>
          {stage === "idle" && (
            <scrapeFetcher.Form method="post">
              <Stack gap={4}>
                <Text opacity={0.5} mb={2}>
                  First step in making your content LLM ready is to scrape it
                  from your website. Give your content URL and set how you want
                  to scrape it for better results.
                </Text>

                <SelectRoot
                  name="type"
                  collection={typeCollection}
                  defaultValue={["web"]}
                  onValueChange={(value) => setType(value.value[0])}
                >
                  <SelectLabel>Type</SelectLabel>
                  <SelectTrigger>
                    <SelectValueText placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeCollection.items.map((item) => (
                      <SelectItem item={item} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>

                <SelectRoot
                  name="scrapeId"
                  collection={scrapesCollection}
                  defaultValue={[searchParams.get("collection") ?? "new"]}
                >
                  <SelectLabel>Collection</SelectLabel>
                  <SelectTrigger>
                    <SelectValueText placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {scrapesCollection.items.map((item) => (
                      <SelectItem item={item} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>

                {type === "web" && (
                  <>
                    <Field label="URL" required>
                      <Input
                        placeholder="https://example.com"
                        name="url"
                        disabled={loading}
                        defaultValue={searchParams.get("url") ?? ""}
                      />
                    </Field>

                    <Field label="Skip URLs">
                      <Input
                        name="skipRegex"
                        placeholder="Ex: /blog or /docs/v1"
                      />
                    </Field>

                    <Field
                      label={
                        <Group>
                          <Text>Remove HTML tags</Text>
                          <Tooltip
                            content="It is highly recommended to remove all unnecessary content from the page. App already removes most of the junk content like navigations, ads, etc. You can also specify specific tags to remove. Garbage in, garbage out!"
                            positioning={{ placement: "top" }}
                            showArrow
                          >
                            <Text>
                              <TbInfoCircle />
                            </Text>
                          </Tooltip>
                        </Group>
                      }
                    >
                      <Input
                        name="removeHtmlTags"
                        placeholder="Ex: aside,header,#ad,.link"
                      />
                    </Field>

                    <Stack direction={["column", "row"]} gap={4}>
                      <SelectRoot
                        name="maxLinks"
                        collection={maxLinks}
                        defaultValue={[searchParams.get("links") ?? "300"]}
                      >
                        <SelectLabel>Select max pages</SelectLabel>
                        <SelectTrigger>
                          <SelectValueText placeholder="Select max links" />
                        </SelectTrigger>
                        <SelectContent>
                          {maxLinks.items.map((maxLink) => (
                            <SelectItem item={maxLink} key={maxLink.value}>
                              {maxLink.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>

                      <Field
                        label={
                          <Group>
                            <Text>Dynamic fallback content length</Text>
                            <Tooltip
                              content="If the content length is less than this number, the content will be fetched dynamically (for client side rendered content)"
                              positioning={{ placement: "top" }}
                              showArrow
                            >
                              <Text>
                                <TbInfoCircle />
                              </Text>
                            </Tooltip>
                          </Group>
                        }
                      >
                        <NumberInputRoot
                          name="dynamicFallbackContentLength"
                          defaultValue="100"
                          w="full"
                        >
                          <NumberInputField />
                        </NumberInputRoot>
                      </Field>
                    </Stack>
                  </>
                )}

                {type === "github-repo" && (
                  <>
                    <Field label="GitHub Repo URL" required>
                      <Input
                        name="githubRepoUrl"
                        placeholder="https://github.com/user/repo"
                      />
                    </Field>

                    <Field label="Branch name" required defaultValue={"main"}>
                      <Input
                        name="githubBranch"
                        placeholder="main"
                      />
                    </Field>
                  </>
                )}

                <Button type="submit" loading={loading} colorPalette={"brand"}>
                  Scrape
                  <TbCheck />
                </Button>
              </Stack>
            </scrapeFetcher.Form>
          )}

          {stage !== "idle" && (
            <Stack>
              <Group justifyContent={"space-between"}>
                <Group>
                  {stage === "scraping" && (
                    <Spinner color="brand.fg" size={"sm"} />
                  )}
                  {stage === "saved" && (
                    <Text color={"brand.fg"}>
                      <TbCircleCheckFilled />
                    </Text>
                  )}

                  {stage === "scraping" && (
                    <>
                      <Text truncate display={["none", "block"]} maxW={"300px"}>
                        Scraping ...{(scraping?.url ?? "").slice(-20)}
                      </Text>
                      <Text truncate display={["block", "none"]}>
                        Scraping ...
                      </Text>
                    </>
                  )}
                  {stage === "saved" && <Text>Done</Text>}
                </Group>

                <Group>
                  <Badge>
                    {scraping?.scrapedCount ?? "-"} /{" "}
                    {scraping
                      ? scraping.scrapedCount + scraping.remainingCount
                      : "∞"}
                  </Badge>
                </Group>
              </Group>
              {stage === "saved" && (
                <Group justifyContent={"flex-end"}>
                  <Button colorPalette={"brand"} asChild>
                    <Link
                      to={`/collections/${scrapeFetcher.data.scrapeId}/settings`}
                    >
                      Go to collection
                      <TbArrowRight />
                    </Link>
                  </Button>
                </Group>
              )}
            </Stack>
          )}
        </Stack>
      </Center>
    </Page>
  );
}
