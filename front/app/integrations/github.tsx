import type { Prisma } from "libs/prisma";
import { useFetcher, useLoaderData } from "react-router";
import {
  SettingsContainer,
  SettingsSection,
  SettingsSectionProvider,
} from "~/components/settings-section";
import { prisma } from "libs/prisma";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import { useState } from "react";
import { makeMeta } from "~/meta";
import { RadioCard } from "~/components/radio-card";
import { TbArrowRight, TbBrandGithub } from "react-icons/tb";

type GithubFields = {
  githubRepo?: string | null;
  githubOrg?: string | null;
};

function normalizeGithubRepo(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

function normalizeGithubOwner(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

export async function loader({ request }: { request: Request }) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    scrape,
    githubAppInstallUrl: process.env.GITHUB_APP_INSTALL_URL ?? "",
  };
}

export function meta() {
  return makeMeta({
    title: "GitHub - CrawlChat",
  });
}

export async function action({ request }: { request: Request }) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const targetType = (formData.get("githubTargetType") as string) ?? "repo";
  const repo = formData.get("githubRepo") as string | null;
  const org = formData.get("githubOrg") as string | null;

  const update: Prisma.ScrapeUpdateInput & GithubFields = {};

  if (targetType === "repo") {
    update.githubRepo = normalizeGithubRepo(repo);
    update.githubOrg = null;
  }

  if (targetType === "org") {
    update.githubOrg = normalizeGithubOwner(org);
    update.githubRepo = null;
  }

  const updatedScrape = await prisma.scrape.update({
    where: { id: scrapeId },
    data: update,
  });

  return { scrape: updatedScrape };
}

export default function GithubIntegrations() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const scrape = loaderData.scrape as typeof loaderData.scrape & GithubFields;
  const [targetType, setTargetType] = useState(
    scrape.githubRepo
      ? "repo"
      : scrape.githubOrg
      ? "org"
      : "repo"
  );
  const [repoValue, setRepoValue] = useState(scrape.githubRepo ?? "");
  const [orgValue, setOrgValue] = useState(scrape.githubOrg ?? "");

  return (
    <SettingsSectionProvider>
      <SettingsContainer>
        <SettingsSection
          id="github-app"
          title="GitHub App"
          description="Install the CrawlChat GitHub App to receive webhooks for issues and discussions."
        >
          {loaderData.githubAppInstallUrl ? (
            <a
              className="btn btn-neutral"
              href={loaderData.githubAppInstallUrl}
              target="_blank"
            >
              <TbBrandGithub />
              Install @CrawlChat
              <TbArrowRight />
            </a>
          ) : (
            <div className="text-base-content/50">
              Set GITHUB_APP_INSTALL_URL to enable the install link.
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          id="github-target"
          title="Repository or organization"
          description="Pick the repo or org to route GitHub issues and discussions into this collection. The bot replies to @crawlchat or when a question matches the knowledge base with enough score."
          fetcher={fetcher}
        >
          <RadioCard
            name="githubTargetType"
            value={targetType}
            onChange={setTargetType}
            cols={2}
            options={[
              {
                label: "Repository",
                value: "repo",
                description: "Respond only for a single repository.",
              },
              {
                label: "Organization",
                value: "org",
                description: "Respond for all repos in the organization.",
              },
            ]}
          />
          <input
            type="hidden"
            name="githubRepo"
            value={targetType === "repo" ? repoValue : ""}
          />
          <input
            type="hidden"
            name="githubOrg"
            value={targetType === "org" ? orgValue : ""}
          />
          {targetType === "repo" ? (
            <input
              className="input w-full"
              placeholder="owner/repo"
              value={repoValue}
              onChange={(event) => setRepoValue(event.target.value)}
            />
          ) : (
            <input
              className="input w-full"
              placeholder="organization"
              value={orgValue}
              onChange={(event) => setOrgValue(event.target.value)}
            />
          )}
        </SettingsSection>
      </SettingsContainer>
    </SettingsSectionProvider>
  );
}
