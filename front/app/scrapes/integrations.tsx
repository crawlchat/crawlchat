import { Page } from "~/components/page";
import { Box, HStack, Stack } from "@chakra-ui/react";
import type { Route } from "./+types/integrations";
import { prisma } from "~/prisma";
import { getSessionScrapeId } from "./util";
import { getAuthUser } from "~/auth/middleware";
import { TbRobotFace, TbCode, TbBrandDiscord, TbPlug } from "react-icons/tb";
import { Outlet, redirect, useLocation, useNavigate } from "react-router";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { useMemo } from "react";
import { createToken } from "~/jwt";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  if (request.method === "DELETE") {
    await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "DELETE",
      body: JSON.stringify({ scrapeId }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createToken(user!.id)}`,
      },
    });
    await prisma.scrape.delete({
      where: { id: scrapeId },
    });
    throw redirect("/collections");
  }
}

export default function ScrapePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);

  function handleTabChange(value: string) {
    navigate(value);
  }

  return (
    <Page title={"Integrations"} icon={<TbPlug />}>
      <Stack>
        <Box>
          <SegmentedControl
            value={tab || "settings"}
            onValueChange={(e) => handleTabChange(e.value)}
            items={[
              {
                value: "/integrations",
                label: (
                  <HStack>
                    <TbCode />
                    Embed
                  </HStack>
                ),
              },
              {
                value: "/integrations/mcp",
                label: (
                  <HStack>
                    <TbRobotFace />
                    MCP
                  </HStack>
                ),
              },

              {
                value: "/integrations/discord",
                label: (
                  <HStack>
                    <TbBrandDiscord />
                    Discord
                  </HStack>
                ),
              },
            ]}
          />
        </Box>

        <Stack mt={6}>
          <Outlet />
        </Stack>
      </Stack>
    </Page>
  );
}
