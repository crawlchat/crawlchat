import { TbBrandDiscord, TbWorld } from "react-icons/tb";
import { JonnyTestimonial } from "../page";

export const companies = {
  remotion: {
    title: "Remotion",
    logo: "https://www.remotion.dev/img/new-logo.png",
    description:
      "Learn more about how Remotion uses CrawlChat to power their documentation.",
    overview: (
      <div>
        <p>
          Remotion is an open-source framework that lets developers create
          videos using React. Instead of traditional video editors, you build
          videos with code, using HTML, CSS, and JavaScript to design animations
          and visuals, which can be rendered into video files like MP4.
        </p>
        <p className="mt-2">
          It’s ideal for dynamic and automated video generation, allowing videos
          to be driven by data, APIs, or user input. Remotion is popular among
          developers who want full control, reusability, and scalability in
          video creation.
        </p>
      </div>
    ),
    challengesSummary:
      "Remotion's documentation is pretty heavy and they have a huge community who find help from the documentation and the Discord server.",
    challenges: [
      "Remotion's documentation is pretty heavy and they have a huge community who find help from the documentation and the Discord server.",
      "Remotion's documentation is not very easy to navigate and it's not very clear what the documentation is about.",
      "Remotion's documentation is not very easy to understand and it's not very clear what the documentation is about.",
      "Remotion's documentation is not very easy to understand and it's not very clear what the documentation is about.",
    ],
    sources: [
      {
        icon: <TbWorld />,
        title: "Website",
        tooltip: "Remotion's documentation website",
      },
      {
        icon: <TbBrandDiscord />,
        title: "Discord",
        tooltip: "Remotion's Discord conversations",
      },
    ],
    channels: [
      {
        icon: <TbWorld />,
        title: "Website",
        tooltip: "Remotion's documentation website",
      },
      {
        icon: <TbBrandDiscord />,
        title: "Discord",
        tooltip: "Remotion's Discord conversations",
      },
    ],
    resultsSummary:
      "Remotion's documentation is now more accessible and easier to navigate, thanks to CrawlChat.",
    results: [
      "Remotion's documentation is now more accessible and easier to navigate, thanks to CrawlChat.",
      "Remotion's documentation is now more accessible and easier to navigate, thanks to CrawlChat.",
    ],
    testimonial: <JonnyTestimonial />,
  },
};
