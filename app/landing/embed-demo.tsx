import { Box, Button, Group, Input, Kbd, Stack, Text } from "@chakra-ui/react";
import { TbArrowRight, TbSearch, TbWorld } from "react-icons/tb";
import { InputGroup } from "~/components/ui/input-group";

export function meta() {
  return [];
}

export default function EmbedDemo() {
  function handleSearch() {
    (window as any).crawlchatEmbed.show();
  }

  return (
    <Stack alignItems={"center"} minH={"100vh"} p={6}>
      <Stack maxW={"1000px"} w={"full"} gap={6}>
        <Group justifyContent={"space-between"}>
          <Group>
            <TbWorld size={26} />
            <Text fontSize={"2xl"} fontWeight={"bold"}>
              My Website
            </Text>
          </Group>

          <Group>
            <InputGroup
              flex="1"
              startElement={<TbSearch />}
              endElement={<Kbd>⌘K</Kbd>}
            >
              <Input placeholder="Search contacts" onClick={handleSearch} />
            </InputGroup>
            <Button>
              Login
              <TbArrowRight />
            </Button>
          </Group>
        </Group>

        <Box w={"full"} h={"100px"} bg={"gray.100"} />

        <Box w={"full"} h={"240px"} bg={"gray.100"} />

        <Box w={"full"} h={"60px"} bg={"gray.100"} />

        <Box w={"full"} h={"60px"} bg={"gray.100"} />

        <Box w={"full"} h={"60px"} bg={"gray.100"} />

        <Box w={"full"} h={"60px"} bg={"gray.100"} />
      </Stack>
    </Stack>
  );
}
