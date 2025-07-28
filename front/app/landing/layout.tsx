import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { Container, CTA, Footer, LandingPage, Nav } from "./page";
import { getLatestChangelog } from "~/changelog/fetch";
import moment from "moment";

export function loader() {
  const latestChangelog = getLatestChangelog();
  const latestChangelogDate = moment(latestChangelog?.date).fromNow();

  return {
    latestChangelog,
    latestChangelogDate,
  };
}

export default function LandingLayout({ loaderData }: Route.ComponentProps) {
  return (
    <LandingPage>
      <Container>
        <Nav changeLogDate={loaderData.latestChangelogDate} />
      </Container>

      <Outlet />

      <Container>
        <CTA />
      </Container>

      <Footer />
    </LandingPage>
  );
}
