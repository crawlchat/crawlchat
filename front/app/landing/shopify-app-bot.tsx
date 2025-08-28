import {
  LandingPage,
  Container,
  Nav,
  Footer,
  CTA,
  Heading,
} from "~/landing/page";
import {
  TbClock,
  TbClockCheck,
  TbHeart,
  TbMessage,
  TbUserHeart,
} from "react-icons/tb";

function Step({
  number,
  title,
  description,
  image,
}: {
  number: number;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-16 mt-32 md:odd:flex-row-reverse">
      <div className="flex flex-col gap-4 flex-1 pt-2">
        <h3 className="text-4xl font-bold font-radio-grotesk">
          <span className="text-brand">{number}.</span> {title}
        </h3>
        <p className="text-lg leading-[1.8]">{description}</p>
      </div>
      <div className="max-w-[400px]">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <img src={image} alt={title} />
        </div>
      </div>
    </div>
  );
}

export default function ShopifyAppBot() {
  const features = [
    { title: "Crafted with feedback", icon: TbHeart },
    { title: "24/7 AI support", icon: TbClock },
    { title: "Happy users", icon: TbUserHeart },
    { title: "Review prompts", icon: TbMessage },
    { title: "Quick to setup", icon: TbClockCheck },
  ];

  return (
    <LandingPage>
      <Container>
        <Nav />
      </Container>

      <Container>
        <div className="flex flex-col md:flex-row gap-16 mt-16">
          <div className="flex-1">
            <h1 className="text-6xl font-bold font-radio-grotesk leading-[1.1] text-center max-w-[800px] mx-auto">
              AI Chat Support for Your{" "}
              <span className="text-brand">Shopify App</span>
            </h1>
            {/* <h2 className="text-xl mt-4 text-center">
              Let Shopify store owners find instant answers through your app's
              documentation—right inside a sleek chat widget.
            </h2> */}
            <p className="text-xl mt-4 text-center max-w-[800px] mx-auto">
              ShopChat is tailor-made by a team of Shopify App developers with
              5+ years of experience with Shopify Apps and 500+ reviews on
              AppStore to reduce support load, increase user satisfaction, and
              turn support tickets into glowing 5-star reviews. Leave no store
              unsatisfied.
            </p>
          </div>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col justify-center items-center mt-32 gap-8">
          <Heading>Built with Shopify App Teams in Mind</Heading>
          <div className="flex gap-8 max-w-[600px] flex-wrap justify-center">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-2 text-brand items-center font-medium min-w-fit"
              >
                <feature.icon size={20} />
                <span className="leading-none">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container>
        <Step
          number={1}
          title="Add your documentation URL"
          description="We crawl your help docs, FAQs, or knowledge base and transform them into a smart, searchable chat assistant."
          image="/ticket-enquire.png"
        />
        <Step
          number={2}
          title="Embed on your app or site"
          description="Install the ShopChat widget in minutes—no code required. Fully optimized for Shopify Apps."
          image="/ticket-form.png"
        />
        <Step
          number={3}
          title="Train your AI assistant"
          description="Customize tone, responses, and fallback behavior to match your support style. Improve continuously through built-in feedback loops."
          image="/ticket-admin.png"
        />
        <Step
          number={4}
          title="Create tickets for unresolved queries"
          description="When AI can’t resolve a query, it hands it off to your team via an internal ticketing system—fast, clean, and trackable."
          image="/ticket-resolve.png"
        />
        <Step
          number={5}
          title="Convert help into high ratings"
          description="After resolving an issue, ShopChat gently nudges users to leave a review—helping your app climb the Shopify charts."
          image="/ticket-resolve.png"
        />
      </Container>

      <Container>
        <CTA text="From Support Burden to 5-Star Ratings" />
      </Container>

      <Footer />
    </LandingPage>
  );
}
