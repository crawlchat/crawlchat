import { Box, Group, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { TbMenu } from "react-icons/tb";
import { AppContext } from "~/dashboard/context";

export function Page({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const { menuOpen, setMenuOpen } = useContext(AppContext);

  return (
    <Stack h="full" gap={0}>
      <Stack
        p={4}
        borderBottom={"1px solid"}
        borderColor={"brand.outline"}
        h={"60px"}
        justify="center"
      >
        <Group justify="space-between">
          <Group>
            <IconButton
              size={"xs"}
              display={["flex", "flex", "none"]}
              variant={"subtle"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <TbMenu />
            </IconButton>
            <Heading display={"flex"} alignItems={"center"} gap={2}>
              <Text>{icon}</Text>
              <Text lineClamp={1}>{title}</Text>
            </Heading>
          </Group>
          {right}
        </Group>
      </Stack>
      <Box p={4} h="full">
        {children}
      </Box>
    </Stack>
  );
}
