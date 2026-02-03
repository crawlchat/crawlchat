import type { KnowledgeGroupType } from "@prisma/client";
import { useMemo } from "react";
import { FaConfluence } from "react-icons/fa";
import { SiDocusaurus, SiLinear } from "react-icons/si";
import {
  TbBook,
  TbBrandDiscord,
  TbBrandGithub,
  TbBrandNotion,
  TbBrandSlack,
  TbFile,
  TbVideo,
  TbWorld,
} from "react-icons/tb";

export function KnowledgeGroupBadge({
  type,
  subType,
}: {
  type: KnowledgeGroupType;
  subType?: string;
}) {
  const [icon, text] = useMemo(() => {
    if (type === "scrape_web") {
      if (subType === "docusaurus") {
        return [<SiDocusaurus />, "Docusaurus"];
      }
      return [<TbWorld />, "Web"];
    } else if (type === "scrape_github") {
      return [<TbBrandGithub />, "GitHub"];
    } else if (type === "learn_discord") {
      return [<TbBrandDiscord />, "Discord"];
    } else if (type === "learn_slack") {
      return [<TbBrandSlack />, "Slack"];
    } else if (type === "github_issues") {
      return [<TbBrandGithub />, "GH Issues"];
    } else if (type === "github_discussions") {
      return [<TbBrandGithub />, "GH Discussions"];
    } else if (type === "upload") {
      return [<TbFile />, "File"];
    } else if (type === "notion") {
      return [<TbBrandNotion />, "Notion"];
    } else if (type === "confluence") {
      return [<FaConfluence />, "Confluence"];
    } else if (type === "linear") {
      return [<SiLinear />, "Linear Issues"];
    } else if (type === "linear_projects") {
      return [<SiLinear />, "Linear Projects"];
    } else if (type === "youtube") {
      return [<TbVideo />, "YouTube"];
    } else if (type === "youtube_channel") {
      return [<TbVideo />, "YouTube Channel"];
    } else if (type === "custom") {
      return [<TbBook />, "Custom"];
    }

    return [<TbBook />, "Unknown"];
  }, [type]);
  return (
    <div className="badge badge-soft badge-primary">
      {icon}
      {text}
    </div>
  );
}
