import { readPost } from "./posts";
import type { Route } from "./+types/page";
import { redirect } from "react-router";
import { LandingPage, Container, Nav, CTA, Footer } from "~/landing-v2/page";

export function loader({ params }: Route.LoaderArgs) {
  try {
    return { post: readPost(params.slug) };
  } catch (error) {
    throw redirect(`/blog`);
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data.post.title,
      description: data.post.description,
    },
  ];
}

export default function BlogPage({ loaderData }: Route.ComponentProps) {
  return (
    <LandingPage>
      <Container>
        <Nav />
      </Container>

      <Container>
        <CTA />
      </Container>

      <Footer />
    </LandingPage>
  );
}
