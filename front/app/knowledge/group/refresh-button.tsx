import { IconButton } from "@chakra-ui/react";
import { useEffect } from "react";
import { TbRefresh } from "react-icons/tb";
import { useFetcher } from "react-router";
import { toaster } from "~/components/ui/toaster";
import { Tooltip } from "~/components/ui/tooltip";

export function RefreshButton({
  knowledgeGroupId,
  disabled,
  buttonSize = "xs",
}: {
  knowledgeGroupId: string;
  disabled: boolean;
  buttonSize?: "xs" | "sm" | "md" | "lg";
}) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      toaster.success({
        title: "Group refresh initiated!",
        description: "This may take a while.",
      });
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" action={`/knowledge/group/${knowledgeGroupId}`}>
      <input type="hidden" name="intent" value="refresh" />
      <Tooltip showArrow content="Update the items of the group">
        <IconButton
          size={buttonSize}
          variant={"subtle"}
          type="submit"
          disabled={fetcher.state !== "idle" || disabled}
        >
          <TbRefresh />
        </IconButton>
      </Tooltip>
    </fetcher.Form>
  );
}
