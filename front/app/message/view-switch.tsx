import { Group, IconButton } from "@chakra-ui/react";
import cn from "@meltdownjs/cn";
import { useMemo } from "react";
import { TbMessage, TbMessages } from "react-icons/tb";
import { Link, useMatches } from "react-router";
import { Tooltip } from "~/components/ui/tooltip";

export function ViewSwitch() {
  const matches = useMatches();
  const view = useMemo(() => {
    const match = matches.pop();
    if (match?.pathname === "/messages") {
      return "messages";
    }
    return "conversations";
  }, [matches]);

  return (
    <div className="join hidden md:flex">
      <div className="tooltip tooltip-left" data-tip="Messages">
        <Link
          to={"/messages"}
          className={cn(
            "btn btn-square join-item",
            view === "messages" && "btn-disabled"
          )}
        >
          <TbMessage />
        </Link>
      </div>
      <div className="tooltip tooltip-left" data-tip="Conversations">
        <Link
          to={"/messages/conversations"}
          className={cn(
            "btn btn-square join-item",
            view === "conversations" && "btn-disabled"
          )}
        >
          <TbMessages />
        </Link>
      </div>
    </div>
  );

  return (
    <Group gap={0}>
      <Tooltip content="View as messages">
        <IconButton
          variant={view === "messages" ? "subtle" : "outline"}
          roundedRight={0}
          borderRight={0}
          asChild
        >
          <Link to="/messages">
            <TbMessage />
          </Link>
        </IconButton>
      </Tooltip>
      <Tooltip content="View as conversations">
        <IconButton
          variant={view === "conversations" ? "subtle" : "outline"}
          roundedLeft={0}
        >
          <Link to="/messages/conversations">
            <TbMessages />
          </Link>
        </IconButton>
      </Tooltip>
    </Group>
  );
}
