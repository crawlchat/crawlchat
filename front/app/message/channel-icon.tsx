import { useMemo } from "react";
import {
  TbBrandDiscord,
  TbMessage,
  TbBrandSlack,
  TbRobotFace,
} from "react-icons/tb";
import type { MessageChannel } from "libs/prisma";
import cn from "@meltdownjs/cn";

export function ChannelIcon({ channel }: { channel?: MessageChannel | null }) {
  const [text, icon] = useMemo(() => {
    if (channel === "discord") {
      return ["Discord", <TbBrandDiscord />];
    }
    if (channel === "mcp") {
      return ["MCP", <TbRobotFace />];
    }
    if (channel === "slack") {
      return ["Slack", <TbBrandSlack />];
    }
    return ["Chatbot", <TbMessage />];
  }, [channel]);

  return (
    <div className={cn("badge badge-soft badge-primary px-2")}>
      {icon}
      {text}
    </div>
  );
}
