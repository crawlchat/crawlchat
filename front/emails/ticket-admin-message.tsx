import { Text, Markdown } from "@react-email/components";
import { MailTemplate } from "./template";
import { emailConfig } from "./config";

export default function TicketAdminMessageEmail({
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
      preview="You have a new message on your ticket"
      heading="Ticket"
      icon="🎫"
      brand={scrapeTitle}
      noEmailPreferences
      cta={{
        text: "View ticket",
        href: url,
      }}
    >
      <Text>
        You have a new message on a ticket. Use the below button or this link to
        view the ticket. Anyone with this link can view and reply to the ticket.
      </Text>
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
