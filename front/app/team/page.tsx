import { Stack, Text } from "@chakra-ui/react";
import { TbUsers } from "react-icons/tb";
import { Page } from "~/components/page";

export default function TeamPage() {
  return (
    <Page title="Team" icon={<TbUsers />}>
      <Stack>
        <Text>Team</Text>
      </Stack>
    </Page>
  );
}
