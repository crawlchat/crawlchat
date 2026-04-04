import { allActivePlans } from "@packages/common/plans";
import { makeMeta } from "~/meta";
import { Container, CustomTestimonials, OpenSource } from "./page";

export function meta() {
  return makeMeta({
    title: "Open source - CrawlChat",
    description:
      "Make AI chatbot from your documentation that handles your support queries. Embed it in your website, Discord, or Slack.",
  });
}

export async function loader() {
  return {
    plans: allActivePlans,
  };
}

export default function Landing() {
  return (
    <>
      <Container>
        <OpenSource />
      </Container>

      <Container>
        <CustomTestimonials />
      </Container>
    </>
  );
}
