import { Page } from "~/components/page";
import { Box, HStack, Stack } from "@chakra-ui/react";
import { getAuthUser } from "~/auth/middleware";
import { TbRobotFace, TbCode, TbBrandDiscord, TbPlug, TbBrandSlack } from "react-icons/tb";
import { Outlet, useLocation, useNavigate } from "react-router";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { useMemo } from "react";
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  return { user };
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
              {
                value: "/integrations/slack",
                label: (
                  <HStack>
                    <TbBrandSlack />
                    Slack
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
