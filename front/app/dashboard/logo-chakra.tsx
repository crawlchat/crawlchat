import { Group, Text } from "@chakra-ui/react";
import { RiChatVoiceAiFill } from "react-icons/ri";

export function LogoChakra() {
  return (
    <Group
      fontSize={"2xl"}
      color="brand.fg"
      fontFamily={"Radio Grotesk"}
      alignItems={"center"}
    >
      <Text fontSize={"3xl"}>
        <RiChatVoiceAiFill />
      </Text>
      <Text>CrawlChat</Text>
    </Group>
  );
}
