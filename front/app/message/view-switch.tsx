import { useMemo } from "react";
import { TbMessage, TbMessages } from "react-icons/tb";
import { Link, useMatches } from "react-router";

export function ViewSwitch() {
  const matches = useMatches();
  const view = useMemo(() => {
    const match = matches.pop();
    if (match?.pathname === "/questions") {
      return "messages";
    }
    return "conversations";
  }, [matches]);

  if (view === "messages") {
    return (
      <Link
        to={"/questions/conversations"}
        className="btn btn-primary btn-soft"
      >
        <TbMessages />
        <span className="hidden md:block">Conversations</span>
      </Link>
    );
  }

  return (
    <Link to={"/questions"} className="btn btn-primary btn-soft">
      <TbMessage />
      <span className="hidden md:block">Questions</span>
    </Link>
  );
}
