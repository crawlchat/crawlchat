import { Box, Center, Group, Input, Stack, Text } from "@chakra-ui/react";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "../+types/root";
import { authenticator } from ".";
import { commitSession, getSession } from "~/session";
import { Alert } from "~/components/ui/alert";
import { useEffect, useRef, useState } from "react";
import { RiChatVoiceAiFill } from "react-icons/ri";
import { TbArrowRight } from "react-icons/tb";
import { getAuthUser } from "./middleware";
import "../fonts.css";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { dontRedirect: true });

  if (user) {
    return redirect("/app");
  }

  const searchParams = new URL(request.url).searchParams;

  return { mailSent: !!searchParams.has("mail-sent") };
}

export function meta() {
  return [
    {
      title: "Login - CrawlChat",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const user = await authenticator.authenticate("magic-link", request);

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const session = await getSession(request.headers.get("cookie"));
  session.set("userId", user.id);
  return redirect("/app", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

function Testi1() {
  return (
    <Box>
      <blockquote className="twitter-tweet">
        <p lang="en" dir="ltr">
          MCP, llms.txt and{" "}
          <a href="https://t.co/wvTaGlv99L">https://t.co/wvTaGlv99L</a> are now
          live!
          <br />
          <br />
          Thanks to{" "}
          <a href="https://twitter.com/pramodk73?ref_src=twsrc%5Etfw">
            @pramodk73
          </a>{" "}
          and <a href="https://t.co/dv2PDLzt2V">https://t.co/dv2PDLzt2V</a> for
          getting us up to speed with AI integrations.{" "}
          <a href="https://t.co/Sornu9aIFi">https://t.co/Sornu9aIFi</a>
        </p>
        &mdash; Jonny Burger (@JNYBGR){" "}
        <a href="https://twitter.com/JNYBGR/status/1899786274635927674?ref_src=twsrc%5Etfw">
          March 12, 2025
        </a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" />
    </Box>
  );
}

function Testi2() {
  return (
    <Box>
      <blockquote className="twitter-tweet">
        <p lang="en" dir="ltr">
          Integrated{" "}
          <a href="https://t.co/uKP4sKdbjV">https://t.co/uKP4sKdbjV</a> into the
          new Konva docs – hats off to{" "}
          <a href="https://twitter.com/pramodk73?ref_src=twsrc%5Etfw">
            @pramodk73
          </a>{" "}
          for making it insanely useful.
          <br />
          <br />
          It now powers:
          <br />- &quot;Ask AI&quot; widget on site
          <br />- MCP server for docs
          <br />- Discord bot for community
          <br />
          <br />
          Smarter docs. Better support.
        </p>
        &mdash; Anton Lavrenov (@lavrton){" "}
        <a href="https://twitter.com/lavrton/status/1915467775734350149?ref_src=twsrc%5Etfw">
          April 24, 2025
        </a>
      </blockquote>{" "}
      <script async src="https://platform.twitter.com/widgets.js" />
    </Box>
  );
}

function Testi3() {
  return (
    <Box>
      <iframe
        src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7323678686812020736"
        height="860"
        width="500px"
        frameBorder="0"
        allowFullScreen
        title="Embedded post"
      ></iframe>
    </Box>
  );
}

export default function LoginPage() {
  const fetcher = useFetcher();
  const { mailSent } = useLoaderData();
  const emailRef = useRef<HTMLInputElement>(null);
  const [testiIndex, setTestiIndex] = useState(Math.floor(Math.random() * 3));

  useEffect(() => {
    if (mailSent && emailRef.current) {
      emailRef.current.value = "";
    }
  }, [mailSent]);

  return (
    <Group h="100dvh" w="98vw" gap={4} alignItems={"stretch"}>
      <Stack
        bg="brand.outline"
        flex={1}
        justifyContent={"center"}
        alignItems={"center"}
        display={["none", "none", "none", "flex"]}
        px={4}
        position={"relative"}
        gap={0}
      >
        <Text fontSize={"2xl"} fontWeight={"bold"} textAlign={"center"} py={4}>
          People love{" "}
          <Text as={"span"} color={"brand.fg"} fontFamily={"Radio Grotesk"}>
            CrawlChat
          </Text>{" "}
          ❤️
        </Text>
        <Stack maxW="500px" overflowY={"auto"} className="no-scrollbar" pb={4}>
          {testiIndex === 0 && <Testi1 />}
          {testiIndex === 1 && <Testi2 />}
          {testiIndex === 2 && <Testi3 />}
        </Stack>
      </Stack>
      <Stack flex={1}>
        <Center h="full">
          <fetcher.Form method="post">
            <Stack w="240px" align="center" gap={6}>
              <Stack
                fontSize={"2xl"}
                fontWeight={"bold"}
                color="brand.fg"
                fontFamily={"Radio Grotesk"}
                alignItems={"center"}
              >
                <Text>
                  <RiChatVoiceAiFill />
                </Text>
                <Text>CrawlChat</Text>
              </Stack>

              <Stack>
                <Text textAlign={"center"} opacity={"0.5"} fontSize={"sm"}>
                  Enter your email to get the login link
                </Text>
                <Stack w="full">
                  <Input
                    ref={emailRef}
                    type="email"
                    w="full"
                    placeholder="myemail@example.com"
                    name="email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  />

                  {mailSent && (
                    <Alert title="Email sent" status={"success"}>
                      Check your email for a login link.
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    w="full"
                    loading={fetcher.state !== "idle"}
                    colorPalette={"brand"}
                  >
                    Login
                    <TbArrowRight />
                  </Button>
                  {fetcher.data?.error && (
                    <Alert title="Error" status={"error"}>
                      {fetcher.data.error}
                    </Alert>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </fetcher.Form>
        </Center>
      </Stack>
    </Group>
  );
}
