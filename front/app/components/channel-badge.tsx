import cn from "@meltdownjs/cn";
import type { MessageChannel } from "libs/prisma";
import { useMemo } from "react";
import {
  TbBrandDiscord,
  TbBrandGoogleFilled,
  TbBrandSlack,
  TbCode,
  TbMessage,
  TbRobotFace,
} from "react-icons/tb";

export function ChannelBadge({
  channel,
  onlyIcon,
}: {
  channel?: MessageChannel | null;
  onlyIcon?: boolean;
}) {
  const channelName = useMemo(() => {
    if (!channel) return "Chatbot";
    if (channel === "discord") return "Discord";
    if (channel === "slack") return "Slack";
    if (channel === "mcp") return "MCP";
    if (channel === "api") return "API";
    if (channel === "widget") return "Chatbot";
    if (channel === "google_chat") return "Google Chat";
    return channel;
  }, [channel]);

  return (
    <div className="tooltip" data-tip={onlyIcon ? channelName : null}>
      <span
        className={cn(
          "badge badge-soft",
          !channel && "badge-primary",
          channel === "discord" && "badge-info",
          channel === "slack" && "badge-error",
          channel === "mcp" && "badge-success",
          channel === "api" && "badge-neutral",
          channel === "widget" && "badge-primary",
          channel === "google_chat" && "badge-info",
        )}
      >
        {!channel && <TbMessage />}
        {channel === "discord" && <TbBrandDiscord />}
        {channel === "slack" && <TbBrandSlack />}
        {channel === "mcp" && <TbRobotFace />}
        {channel === "api" && <TbCode />}
        {channel === "widget" && <TbMessage />}
        {channel === "google_chat" && <TbBrandGoogleFilled />}

        {!onlyIcon && channelName}
      </span>
    </div>
  );
}
