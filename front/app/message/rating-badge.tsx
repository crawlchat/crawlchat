import { Badge } from "@chakra-ui/react";
import type { Message } from "libs/prisma";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";
import { Tooltip } from "~/components/ui/tooltip";

export function Rating({ rating }: { rating: Message["rating"] }) {
  if (!rating) return null;

  return (
    <Tooltip content="Rating from the user" showArrow>
      <Badge
        colorPalette={rating === "up" ? "green" : "red"}
        variant={"surface"}
      >
        {rating === "up" ? <TbThumbUp /> : <TbThumbDown />}
      </Badge>
    </Tooltip>
  );
}
