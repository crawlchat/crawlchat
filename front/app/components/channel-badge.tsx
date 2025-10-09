import cn from "@meltdownjs/cn";
import type { MessageChannel } from "libs/prisma";
import {
  TbApi,
  TbBrandDiscord,
  TbBrandSlack,
  TbCode,
  TbKey,
  TbMessage,
  TbRobotFace,
} from "react-icons/tb";

export function ChannelBadge({ channel }: { channel?: MessageChannel | null }) {
  return (
    <span
      className={cn(
        "badge badge-soft",
        !channel && "badge-primary",
        channel === "discord" && "badge-info",
        channel === "slack" && "badge-error",
        channel === "mcp" && "badge-success",
        channel === "api" && "badge-neutral",
      )}
    >
      {!channel && <TbMessage />}
      {channel === "discord" && <TbBrandDiscord />}
      {channel === "slack" && <TbBrandSlack />}
      {channel === "mcp" && <TbRobotFace />}
      {channel === "api" && <TbCode />}

      {!channel && "Chatbot"}
      {channel === "discord" && "Discord"}
      {channel === "slack" && "Slack"}
      {channel === "mcp" && "MCP"}
      {channel === "api" && "API"}
    </span>
  );
}
