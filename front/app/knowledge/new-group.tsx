import {
  Input,
  Stack,
  Group,
  Text,
  createListCollection,
  Center,
  RadioCard,
  HStack,
  Icon,
  Checkbox,
} from "@chakra-ui/react";
import {
  TbBook2,
  TbBrandGithub,
  TbCheck,
  TbInfoCircle,
  TbWorld,
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
    let skipRegex = formData.get("skipRegex");
    let allowOnlyRegex = formData.get("allowOnlyRegex");
    let dynamicFallbackContentLength = formData.get(
      "dynamicFallbackContentLength"
    );
    let removeHtmlTags = formData.get("removeHtmlTags");
    let includeHtmlTags = formData.get("includeHtmlTags");

    let type = formData.get("type") as KnowledgeGroupType;
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

    if (!url) {
      return { error: "URL is required" };
    }

    if (prefix === "on") {
      allowOnlyRegex = `^${url.replace(/\/$/, "")}.*`;
    }

    const group = await prisma.knowledgeGroup.create({
      data: {
        scrapeId,
        userId: user!.id,
        type,
        status: "pending",

        title,

        url,
        matchPrefix: prefix === "on",
        removeHtmlTags: removeHtmlTags as string,
        maxPages: parseInt(maxLinks as string),
        staticContentThresholdLength: parseInt(
          dynamicFallbackContentLength as string
        ),

        githubBranch: githubBranch as string,
        githubUrl: githubRepoUrl as string,
      },
    });

    throw redirect(`/knowledge`);
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
    { label: "2000 pages", value: "2000" },
    { label: "5000 pages", value: "5000" },
  ],
});

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
        },
        {
          title: "GitHub Repo",
          value: "scrape_github",
          description: "Scrape a GitHub repository",
          icon: <TbBrandGithub />,
        },
      ];
    },
    [loaderData.scrapes]
  );
  const [type, setType] = useState<KnowledgeGroupType>("scrape_web");

  return (
    <Page title="New knowledge group" icon={<TbBook2 />}>
      <Center w="full" h="full">
        <Stack maxW={"500px"} w={"full"}>
          <scrapeFetcher.Form method="post">
            <Stack gap={4}>
              <RadioCard.Root
                name="type"
                value={type}
                onValueChange={(value) =>
                  setType(value.value as KnowledgeGroupType)
                }
              >
                <RadioCard.Label>Select type</RadioCard.Label>
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
                      placeholder="https://example.com"
                      name="url"
                      disabled={scrapeFetcher.state !== "idle"}
                    />
                  </Field>

                  <Checkbox.Root name="prefix">
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>Match exact prefix</Checkbox.Label>
                  </Checkbox.Root>

                  <Group gap={4}>
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
                  </Group>

                  <Stack direction={["column", "row"]} gap={4}>
                    <SelectRoot
                      name="maxLinks"
                      collection={maxLinks}
                      defaultValue={["300"]}
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

              <Button
                type="submit"
                loading={scrapeFetcher.state !== "idle"}
                colorPalette={"brand"}
              >
                Save
                <TbCheck />
              </Button>
            </Stack>
          </scrapeFetcher.Form>
        </Stack>
      </Center>
    </Page>
  );
}
