import { Outlet } from "react-router";
import { Container, CTA, Footer, LandingPage, Nav } from "./page";
import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { dontRedirect: true });

  return {
    user,
  };
}

export default function LandingLayout({ loaderData }: Route.ComponentProps) {
  return (
    <LandingPage>
      <Container>
        <Nav user={loaderData.user} />
      </Container>

      <Outlet />

      <Container>
        <CTA />
      </Container>

      <Footer />
    </LandingPage>
  );
}
