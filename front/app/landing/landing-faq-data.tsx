import type { FaqItem } from "./faq";

export const landingFaqItems: FaqItem[] = [
  {
    question: "How do I train with my documentation?",
    answer: (
      <p>
        There is technically no special process like training the AI chatbot.
        All you need to do is to add your existing help documentation about your
        product or service to the knowledge base. You can either pass the URL of
        your documentation or upload the files (multiple formats are supported)
        to the knowledge base. The chatbot will smartly understand the
        documentation and uses it to answer the questions.
      </p>
    ),
  },
  {
    question: "What is documentation AI?",
    answer: (
      <p>
        Documentation AI is an assistant that answers questions using your
        existing docs as the source of truth. CrawlChat indexes your technical
        documentation and serves source-linked answers on your website, Discord,
        Slack, and other channels.
      </p>
    ),
  },
  {
    question: "How does CrawlChat reduce hallucination in AI answers?",
    answer: (
      <p>
        CrawlChat grounds responses in your knowledge base and includes source
        links with answers, so users can verify where information comes from.
        You can monitor conversations, identify weak responses, and improve docs
        continuously to reduce hallucinations over time.
      </p>
    ),
  },
  {
    question: "I already use other chatbots, why do I switch?",
    answer: (
      <div>
        CrawlChat shines in three areas:
        <ul className="list-disc list-inside pl-4 my-4">
          <li>
            CrawlChat uses latest LLM models and gives you the best answers for
            your customer queries.
          </li>
          <li>
            It comes with a support ticket system that ensures queries reach you
            when documentation isn't sufficient.
          </li>
          <li>
            It provides all the necessary analytics required to monitor the
            performance of the chatbot and fine tune your documentation.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "Do I need to bring my own OpenAI API key?",
    answer: (
      <p>
        No, CrawlChat uses the latest LLM models from OpenAI, Anthropic, Google,
        and Gemini. You can use the chatbot without any API key. You can choose
        the model that best suits your needs from the dashboard.
      </p>
    ),
  },
  {
    question: "Does it support other languages?",
    answer: (
      <p>
        Absolutely. That's the advantage of using AI based chatbots. The LLMs/AI
        models are capable of answering your customer or client's queries in
        their own language out of the box. This includes all major 32 languages
        like English, Spanish, French, German, Italian, Portuguese, Russian,
        Chinese, Japanese, Korean, etc.
      </p>
    ),
  },
  {
    question: "Can I try it out first?",
    answer: (
      <p>
        You can signup and try out the platform with free credits you get on
        signup. You can check the{" "}
        <a href="/#pricing" className="text-primary">
          pricing
        </a>{" "}
        section for more details about the credits.
      </p>
    ),
  },
  {
    question: "How can I integrate the Ask AI widget to my website?",
    answer: (
      <p>
        It is a very simple process. You can navigate to the integration section
        and copy the code snippet. You can then paste the code snippet in your
        website. It also provides config for documentation solutions like
        Docusaurus, etc.
      </p>
    ),
  },
  {
    question: "How can I integrate it with Slack or Discord?",
    answer: (
      <p>
        Yes! CrawlChat provides a Discord bot and a Slack app that can be
        integrated with your Discord or Slack server. You can find the
        instructions to integrate the chatbot to your Discord or Slack server in
        the{" "}
        <a href="/discord-bot" className="text-primary">
          Discord bot
        </a>{" "}
        and Slack app pages. Once added to the channel or server, your community
        can tag <span className="text-primary">@CrawlChat</span> to ask
        questions to get the answers.
      </p>
    ),
  },
  {
    question: "What kind of analytics does it provide?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          CrawlChat gives rating to each answer based on the relevance of the
          answer to the question. The more the score is, the better the answer
          and the documentation was for the given query. CrawlChat provides
          charts over time, distribution of the score and per message &
          conversation scores as well. They help you to monitor the performance
          of the chatbot and the knowledge base.
        </p>
        <p>
          It also provides analytics on geo location of the users, browser,
          device, etc. so that you can understand the user behavior and improve
          your documentation.
        </p>
        <p>
          Apart from that, you can also see what knowledge groups are being used
          the most to answer the questions.
        </p>
      </div>
    ),
  },
  {
    question: "What happens if the message credits run out?",
    answer: (
      <p>
        The message credits are reset every month whenever the subscription is
        renewed. Whereas the pages is the number of unique pages (maxed to a set
        of characters) you have at any given point of time. Choose the plan that
        best suits your needs. You can topup your message credits by sending an
        email to support.
      </p>
    ),
  },
  {
    question: "How can I customise the Ask AI widget?",
    answer: (
      <p>
        You can configure your own brand colors, text, logo for the Ask AI
        button that will be visible on your website. This can be controlled from
        the dashboard without updating the embedded snippet.
      </p>
    ),
  },
];
