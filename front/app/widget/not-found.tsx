import { Stack, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { TbMoodSad, TbX } from "react-icons/tb";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
  }, []);

  function handleClose() {
    window.parent.postMessage("close", "*");
  }

  return (
    <Stack
      w="100dvw"
      h="100dvh"
      justify={"center"}
      align={"center"}
      bg="blackAlpha.600"
    >
      <Stack bg="brand.white" p={6} justify={"center"} align={"center"} rounded={"lg"}>
        <Text fontSize={"5xl"}>
          <TbMoodSad/>
        </Text>
        <Text>Chat not found. Contact the owner.</Text>
        <Button size={"xs"} onClick={handleClose}>
          Close <TbX/>
        </Button>
      </Stack>
    </Stack>
  );
}
