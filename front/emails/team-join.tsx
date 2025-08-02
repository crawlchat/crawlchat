import { Text, Markdown } from "@react-email/components";
import { MailTemplate } from "./template";
import { emailConfig } from "./config";

export default function TeamJoinEmail({
  scrapeTitle,
  invitedBy,
}: {
  invitedBy: string;
  scrapeTitle: string;
}) {
  const url = `${emailConfig.baseUrl}/login`;
  return (
    <MailTemplate
      title="CrawlChat Member"
      preview={"You have been added to " + scrapeTitle}
      heading="Joined"
      icon="😎"
      brand={scrapeTitle}
      noEmailPreferences
      cta={{
        text: "Go to team",
        href: url,
      }}
    >
      <Text>
        Hi there! You have been added to the team of {scrapeTitle} by{" "}
        {invitedBy}. Click the following button to go to the team.
      </Text>
    </MailTemplate>
  );
}
