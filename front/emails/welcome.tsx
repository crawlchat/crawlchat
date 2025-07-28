import { Markdown, Text } from "@react-email/components";
import { MailTemplate } from "./template";
import { emailConfig } from "./config";

export default function WelcomeEmail() {
  return (
    <MailTemplate
      title="Welcome to CrawlChat"
      preview="Thanks for signing up on CrawlChat. Let's get you started."
      heading="Welcome"
      icon="👋"
      brand="CrawlChat"
      cta={{
        text: "Go to dashboard",
        href: `${emailConfig.baseUrl}/login`,
      }}
      noEmailPreferences
    >

      <Markdown markdownCustomStyles={{
        p: {
          lineHeight: "1.4"
        }
      }}>
        {`Hello 👋

Welcome to **CrawlChat**. You are at the right place to add AI support chatbot for your _website_, _Discord server_, or _Slack_.

In short here is what you can do with CrawlChat:

- Add your own documentation as knowledge base by **scraping**
- Upload **PDFs** as knowledge base
- Embed the AI chatbot on your website, Discord server, or Slack
- Enable **support tickets** for your users
- If no documentation available for queries, users create a support ticket
- Resolve them manually or with **AI**
- Monitor and analyze queries, data growth, and more

Here are few links to get you started:

- [Ask any query](https://crawlchat.app/w/crawlchat)
- [Guides](https://guides.crawlchat.app)
- [Roadmap](https://crawlchat.features.vote/roadmap)
- [Discord](https://discord.gg/zW3YmCRJkC)

Looking forward to see you integrate CrawlChat in your products and services 🚀

CrawlChat Team
`}
      </Markdown>
    </MailTemplate>
  );
}
