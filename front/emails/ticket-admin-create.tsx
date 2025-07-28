import { Markdown, Text } from "@react-email/components";
import { MailTemplate } from "./template";
import { emailConfig } from "./config";

export default function TicketAdminCreateEmail({
  scrapeTitle,
  ticketNumber,
  title,
  message,
  email,
}: {
  scrapeTitle: string;
  ticketNumber: number;
  title: string;
  message: string;
  email: string;
}) {
  const url = `${emailConfig.baseUrl}/ticket/${ticketNumber}`;
  return (
    <MailTemplate
      title="CrawlChat Ticket"
      preview="You have a new ticket to resolve"
      heading="Ticket"
      icon="🎫"
      brand={scrapeTitle}
      cta={{
        text: "View ticket",
        href: url,
      }}
    >
      <Text>You have a new ticket to resolve. Here are the details:</Text>

      <Text>
        <span style={{ opacity: 0.5 }}>Email</span>
        <br />
        {email ?? "user@example.com"}
        <br />
        <br />
        <span style={{ opacity: 0.5 }}>Title</span>
        <br />
        {title ?? "Sample ticket title"}
        <br />
        <br />
        <span style={{ opacity: 0.5 }}>Message</span>
        <br />
        {message ?? "Sample message"}
      </Text>

      <Text style={{ opacity: 0.5 }}>{url}</Text>
    </MailTemplate>
  );
}
