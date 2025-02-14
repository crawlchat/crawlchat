import { IconButton, Stack } from "@chakra-ui/react";
import type { Route } from "./+types/thread";
import { prisma } from "~/prisma";
import { redirect, useFetcher } from "react-router";
import ChatBox from "./chat-box";
import { getAuthUser } from "~/auth/middleware";
import { createToken } from "~/jwt";
import { Page } from "~/components/page";
import { getThreadName } from "~/thread-util";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context";
import { TbCheck, TbMessage, TbTrash } from "react-icons/tb";

export async function loader({ params, request }: Route.LoaderArgs) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
  });
  if (!thread) {
    throw redirect("/app");
  }
  const user = await getAuthUser(request, { userId: thread.userId });
  if (!user) {
    throw redirect("/app");
  }
  const token = createToken(user.id);
  return { thread, token };
}

export async function action({ params }: Route.ActionArgs) {
  await prisma.thread.delete({
    where: { id: params.id },
  });
  return redirect("/app");
}

export default function Thread({ loaderData }: Route.ComponentProps) {
  const deleteFetcher = useFetcher();
  const { threadTitle } = useContext(AppContext);
  const [deleteActive, setDeleteActive] = useState(false);

  useEffect(() => {
    if (deleteActive) {
      setTimeout(() => {
        setDeleteActive(false);
      }, 3000);
    }
  }, [deleteActive]);

  function handleDelete() {
    if (!deleteActive) {
      setDeleteActive(true);
      return;
    }
    deleteFetcher.submit(null, {
      method: "delete",
    });
  }

  return (
    <Page
      title={
        threadTitle[loaderData.thread.id] ??
        getThreadName(loaderData.thread.messages)
      }
      icon={<TbMessage />}
      right={
        <IconButton
          size={"xs"}
          variant={"subtle"}
          onClick={handleDelete}
          colorPalette={
            deleteActive || deleteFetcher.state !== "idle" ? "red" : undefined
          }
          disabled={deleteFetcher.state !== "idle"}
        >
          {deleteActive || deleteFetcher.state !== "idle" ? (
            <TbCheck />
          ) : (
            <TbTrash />
          )}
        </IconButton>
      }
    >
      <Stack maxW={"700px"}>
        <ChatBox
          token={loaderData.token}
          thread={loaderData.thread}
          key={loaderData.thread.id}
        />
      </Stack>
    </Page>
  );
}
