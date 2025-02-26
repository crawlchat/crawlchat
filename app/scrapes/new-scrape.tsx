import {
  Input,
  Stack,
  Group,
  Text,
  Badge,
  createListCollection,
  Center,
} from "@chakra-ui/react";
import {
  TbCheck,
  TbCircleCheckFilled,
  TbInfoCircle,
  TbScan,
} from "react-icons/tb";
import { redirect, useFetcher } from "react-router";
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
import { useEffect } from "react";
import { prisma } from "~/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  return {
    token: createToken(user!.id),
  };
}

export async function action({ request }: { request: Request }) {
  const user = await getAuthUser(request);
  const formData = await request.formData();

  if (request.method === "POST") {
    const url = formData.get("url");
    const maxLinks = formData.get("maxLinks");
    const skipRegex = formData.get("skipRegex");
    const dynamicFallbackContentLength = formData.get(
      "dynamicFallbackContentLength"
    );
    const removeHtmlTags = formData.get("removeHtmlTags");
    const includeHtmlTags = formData.get("includeHtmlTags");

    if (!url) {
      return { error: "URL is required" };
    }

    const scrape = await prisma.scrape.create({
      data: {
        url: url as string,
        userId: user!.id,
        status: "pending",
      },
    });

    const token = createToken(user!.id);

    const response = await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "POST",
      body: JSON.stringify({
        maxLinks,
        skipRegex,
        scrapeId: scrape.id,
        dynamicFallbackContentLength,
        removeHtmlTags,
        includeHtmlTags,
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
  }
}

const maxLinks = createListCollection({
  items: [
    { label: "10 links", value: "10" },
    { label: "50 links", value: "50" },
    { label: "100 links", value: "100" },
    { label: "500 links", value: "500" },
    { label: "1000 links", value: "1000" },
  ],
});

export default function NewScrape({ loaderData }: Route.ComponentProps) {
  const { connect, stage, scraping } = useScrape();
  const scrapeFetcher = useFetcher();

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
                <Field label="URL">
                  <Input
                    placeholder="https://example.com"
                    name="url"
                    disabled={loading}
                  />
                </Field>

                <Field label="Skip URLs">
                  <Input name="skipRegex" placeholder="Ex: /blog or /docs/v1" />
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
                  <SelectRoot name="maxLinks" collection={maxLinks}>
                    <SelectLabel>Select max links</SelectLabel>
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

                <Button type="submit" loading={loading} colorPalette={"brand"}>
                  Scrape
                  <TbCheck />
                </Button>
              </Stack>
            </scrapeFetcher.Form>
          )}

          <Stack fontSize={"sm"}>
            <Group justifyContent={"space-between"}>
              {stage === "scraping" && (
                <>
                  <Text truncate display={["none", "block"]}>
                    Scraping {scraping?.url}
                  </Text>
                  <Text truncate display={["block", "none"]}>
                    Scraping...
                  </Text>
                </>
              )}
              {stage === "scraped" && (
                <Text>Scraping complete</Text>
              )}
              {stage === "saved" && (
                <Group gap={1}>
                  <Text>Done</Text>
                  <Text color={"brand.fg"}>
                    <TbCircleCheckFilled />
                  </Text>
                </Group>
              )}

              {scraping && (
                <Group>
                  <Badge>
                    {scraping?.scrapedCount} /{" "}
                    {scraping?.scrapedCount + scraping?.remainingCount}
                  </Badge>
                </Group>
              )}
            </Group>
          </Stack>
        </Stack>
      </Center>
    </Page>
  );
}
