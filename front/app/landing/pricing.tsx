import { PLAN_FREE, PLAN_PRO, PLAN_STARTER } from "libs/user-plan";
import { Container, Pricing } from "./page";

export function meta() {
  return [
    {
      title: "Pricing - CrawlChat",
    },
    {
      name: "description",
      content:
        "Make AI chatbot from your documentation that handles your support queries. Embed it in your website, Discord, or Slack.",
    },
  ];
}

export async function loader() {
  return {
    freePlan: PLAN_FREE,
    starterPlan: PLAN_STARTER,
    proPlan: PLAN_PRO,
  };
}

export default function Landing() {
  return (
    <>
      <Container>
        <Pricing />
      </Container>
    </>
  );
}
