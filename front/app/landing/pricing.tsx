import {
  PLAN_LAUNCH,
  PLAN_LAUNCH_YEARLY,
  PLAN_GROW,
  PLAN_GROW_YEARLY,
  PLAN_ACCELERATE,
  PLAN_ACCELERATE_YEARLY,
} from "libs/user-plan";
import {
  Container,
  CustomTestimonials,
  FAQ,
  Pricing,
  PricingFeatures,
} from "./page";
import { makeMeta } from "~/meta";

export function meta() {
  return makeMeta({
    title: "Pricing - CrawlChat",
    description:
      "Make AI chatbot from your documentation that handles your support queries. Embed it in your website, Discord, or Slack.",
  });
}

export async function loader() {
  return {
    launchPlan: PLAN_LAUNCH,
    launchYearlyPlan: PLAN_LAUNCH_YEARLY,
    growPlan: PLAN_GROW,
    growYearlyPlan: PLAN_GROW_YEARLY,
    acceleratePlan: PLAN_ACCELERATE,
    accelerateYearlyPlan: PLAN_ACCELERATE_YEARLY,
  };
}

export default function Landing() {
  return (
    <>
      <Container>
        <Pricing noMarginTop />
      </Container>

      <Container>
        <PricingFeatures />
      </Container>

      <CustomTestimonials />

      <Container>
        <FAQ />
      </Container>
    </>
  );
}
