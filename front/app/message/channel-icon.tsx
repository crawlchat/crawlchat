import { Badge, Icon } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  TbBrandDiscord,
  TbMessage,
  TbBrandSlack,
  TbRobotFace,
} from "react-icons/tb";
import type { MessageChannel } from "libs/prisma";

export function ChannelIcon({ channel }: { channel?: MessageChannel | null }) {
  const [text, icon, color] = useMemo(() => {
    if (channel === "discord") {
      return ["Discord", TbBrandDiscord, "orange"];
    }
    if (channel === "mcp") {
      return ["MCP", TbRobotFace, "blue"];
    }
    if (channel === "slack") {
      return ["Slack", TbBrandSlack, "orange"];
    }
    return ["Chatbot", TbMessage, "brand"];
  }, [channel]);

  return (
    <Badge colorPalette={color} variant={"surface"}>
      <Icon as={icon} />
      {text}
    </Badge>
  );
}
