import { Box, Button, Image } from "@chakra-ui/react";
import type { Scrape } from "libs/prisma";
import { useEffect, useRef } from "react";

export function AskAIButton({ scrape }: { scrape: Scrape }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.parent) {
      const html = document.querySelector("html");
      html?.style.setProperty("background", "transparent");

      const rect = boxRef.current?.getBoundingClientRect();
      const width = rect?.width;
      const height = rect?.height;

      window.parent.postMessage(
        JSON.stringify({
          type: "ask-ai-button",
          width,
          height,
        }),
        "*"
      );
    }
  }, []);

  function handleClick() {
    window.parent.postMessage(
      JSON.stringify({
        type: "ask-ai-button-click",
      }),
      "*"
    );
  }

  const text = scrape.widgetConfig?.buttonText || "💬 Ask AI";
  const logoUrl = scrape.widgetConfig?.showLogo
    ? scrape.widgetConfig?.logoUrl
    : null;

  return (
    <Box ref={boxRef} width={"fit-content"} height={"fit-content"}>
      <Button
        rounded={logoUrl ? "lg" : "full"}
        onClick={handleClick}
        w="fit-content"
        h="fit-content"
        flexDirection={"column"}
        px={4}
        py={2}
        bg={scrape.widgetConfig?.primaryColor ?? undefined}
        color={scrape.widgetConfig?.buttonTextColor ?? undefined}
        gap={1}
      >
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={scrape.title ?? "Logo"}
            w={"30px"}
            h={"30px"}
          />
        )}
        {text}
      </Button>
    </Box>
  );
}
