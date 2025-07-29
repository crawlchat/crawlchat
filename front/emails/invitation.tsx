import { Text, Markdown } from "@react-email/components";
import { MailTemplate } from "./template";
import { emailConfig } from "./config";

export default function InvitationEmail({
  scrapeTitle,
  invitedBy,
}: {
  invitedBy: string;
  scrapeTitle: string;
}) {
  const url = `${emailConfig.baseUrl}/login`;
  return (
    <MailTemplate
      title="CrawlChat Invitation"
      preview={"You have been invited to " + scrapeTitle}
      heading="Invitation"
      icon="💬"
      brand={scrapeTitle}
      noEmailPreferences
      cta={{
        text: "Accept it",
        href: url,
      }}
    >
      <Text>
        Hi there! You have been invited to the team of {scrapeTitle} by{" "}
        {invitedBy}. Click the following button to singup and accept the
        invitation.
      </Text>
    </MailTemplate>
  );
}
