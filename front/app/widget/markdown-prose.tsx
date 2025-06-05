import { Prose } from "~/components/ui/prose";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import "highlight.js/styles/vs.css";
import { Box, Image, Link, Stack, Text } from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "~/components/ui/clipboard";
import type { PropsWithChildren } from "react";
import { Tooltip } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { TbArrowRight } from "react-icons/tb";
import { jsonrepair } from "jsonrepair";
const linkifyRegex = require("remark-linkify-regex");

const RichCTA = ({
  title,
  description,
  link,
  ctaButtonLabel,
}: {
  title: string;
  description: string;
  link: string;
  ctaButtonLabel: string;
}) => {
  return (
    <Stack
      border="4px solid"
      borderColor={"brand.outline"}
      p={4}
      rounded={"2xl"}
      w="fit"
      maxW="500px"
      my={8}
    >
      <Text fontWeight={"bold"} m={0}>
        {title}
      </Text>
      <Text m={0}>{description}</Text>
      <Box>
        <Button
          asChild
          textDecoration={"none"}
          color={"brand.black"}
          variant={"subtle"}
        >
          <a href={link} target="_blank">
            {ctaButtonLabel || "Do it"}
            <TbArrowRight />
          </a>
        </Button>
      </Box>
    </Stack>
  );
};

export function MarkdownProse({
  children,
  noMarginCode,
  sources,
  size = "md",
}: PropsWithChildren<{
  noMarginCode?: boolean;
  sources?: Array<{ title: string; url?: string }>;
  size?: "md" | "lg";
}>) {
  return (
    <Prose maxW="full" size={size}>
      <Markdown
        remarkPlugins={[remarkGfm, linkifyRegex(/\!\![0-9a-zA-Z]+!!/)]}
        components={{
          code: ({ node, ...props }) => {
            const { children, className, ...rest } = props;

            if (!className) {
              return <code {...rest}>{children}</code>;
            }

            let language = className?.replace("language-", "");

            if (language.startsWith("json|")) {
              try {
                const json = JSON.parse(jsonrepair(children as string));
                if (language === "json|cta") {
                  return <RichCTA {...json} />;
                }
              } catch (e) {
                console.log(e);
                return null;
              }
            }

            if (!hljs.listLanguages().includes(language)) {
              language = "bash";
            }
            const code = children as string;

            const highlighted = hljs.highlight(code ?? "", {
              language: language ?? "javascript",
            }).value;

            return (
              <Box className="group">
                <Box dangerouslySetInnerHTML={{ __html: highlighted }} />
                <Box
                  position={"absolute"}
                  top={1}
                  right={1}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition={"opacity 100ms ease-in-out"}
                >
                  <ClipboardRoot value={code}>
                    <ClipboardIconButton />
                  </ClipboardRoot>
                </Box>
              </Box>
            );
          },
          img: ({ node, ...props }) => {
            const { src, alt, ...rest } = props;
            return <Image src={src} alt={alt} boxShadow={"none"} {...rest} />;
          },
          pre: ({ node, ...props }) => {
            const { children, ...rest } = props;

            if (
              (children as any).props.className?.startsWith("language-json|")
            ) {
              return <Box my={2}>{children}</Box>;
            }

            return (
              <pre
                {...rest}
                style={{
                  margin: noMarginCode ? 0 : undefined,
                  position: "relative",
                }}
              >
                {children}
              </pre>
            );
          },
          a: ({ node, ...props }) => {
            const { children, ...rest } = props;

            const defaultNode = <a {...rest}>{children}</a>;
            if (!sources || typeof children !== "string") {
              return defaultNode;
            }

            const match = children.match(/\!\!([0-9]*)!!/);
            if (children.startsWith("!!") && !match) {
              return null;
            } else if (!match) {
              return defaultNode;
            }

            const index = parseInt(match[1]);
            const source = sources[index];

            return (
              <Tooltip content={source?.title ?? "Loading..."} showArrow>
                <Text as="span">
                  <Link
                    variant={"plain"}
                    href={source?.url ?? "#"}
                    target="_blank"
                    bg="brand.emphasized"
                    color="brand.white"
                    fontSize={"10px"}
                    height={"16px"}
                    width={"14px"}
                    rounded={"md"}
                    textDecoration={"none"}
                    display={"inline-flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    transform={"translateY(-6px)"}
                  >
                    {index + 1}
                  </Link>
                </Text>
              </Tooltip>
            );
          },
        }}
      >
        {children as string}
      </Markdown>
    </Prose>
  );
}
