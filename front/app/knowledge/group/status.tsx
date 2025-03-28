import { Badge } from "@chakra-ui/react";
import type { KnowledgeGroupStatus } from "libs/prisma";
import { useMemo } from "react";
import { TbBook, TbCheck, TbLoader, TbX } from "react-icons/tb";

export function GroupStatus({ status }: { status: KnowledgeGroupStatus }) {
  const ui = useMemo(() => {
    if (status === "pending") {
      return {
        color: undefined,
        icon: <TbBook />,
        text: "To be processed",
      };
    } else if (status === "done") {
      return {
        color: "brand",
        icon: <TbCheck />,
        text: "Up to date",
      };
    } else if (status === "error") {
      return {
        color: "red",
        icon: <TbX />,
        text: "Error",
      };
    } else if (status === "processing") {
      return {
        color: "blue",
        icon: <TbLoader />,
        text: "Updating",
      };
    }

    return {
      color: undefined,
      icon: <TbBook />,
      text: "Unknown",
    };
  }, [status]);

  return (
    <Badge colorPalette={ui.color} variant={"surface"}>
      {ui.icon}
      {ui.text}
    </Badge>
  );
}
