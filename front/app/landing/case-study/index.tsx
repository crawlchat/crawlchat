import cn from "@meltdownjs/cn";
import { TbArrowRight, TbCircleFilled } from "react-icons/tb";
import { makeMeta } from "~/meta";
import {
  Container,
  Heading,
  HeadingDescription,
  HeadingHighlight,
} from "../page";
import { companies } from "./companies";

export function meta() {
  return makeMeta({
    title: "Case Studies: Documentation AI Results - CrawlChat",
    description:
      "Explore CrawlChat case studies from Remotion, Polotno, Postiz, and LocalStack. See how teams use documentation AI for support deflection and faster answers.",
  });
}

export default function CaseStudyIndexPage() {
  const items = Object.entries(companies);

  return (
    <Container>
      <div className="mt-16">
        <div className="flex justify-center">
          <div className="badge badge-secondary badge-soft badge-lg">
            <TbCircleFilled size={12} />
            Case studies
          </div>
        </div>

        <div className="mt-4">
          <Heading>
            Real-world <HeadingHighlight>documentation AI</HeadingHighlight>{" "}
            case studies
          </Heading>
        </div>

        <HeadingDescription>
          Learn how software teams use CrawlChat to improve documentation
          support, reduce repetitive questions, and deliver faster answers
          across community and internal channels.
        </HeadingDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-12">
        {items.map(([slug, company]) => (
          <a
            key={slug}
            href={`/case-study/${slug}`}
            className="rounded-box border border-base-300 p-6 hover:border-primary transition-all flex flex-col gap-4"
          >
            <div
              className={cn(
                "h-14 flex items-center px-2 rounded-box",
                company.darkLogo && "bg-black w-fit px-4 rounded-full"
              )}
            >
              <img
                src={company.logo}
                alt={company.title}
                className="max-h-10"
              />
            </div>
            <h2 className="text-2xl font-brand">{company.title}</h2>
            <p className="text-base-content/70">{company.description}</p>
            <span className="inline-flex items-center gap-1 text-primary font-medium">
              Read case study
              <TbArrowRight />
            </span>
          </a>
        ))}
      </div>
    </Container>
  );
}
