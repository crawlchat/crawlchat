import { Row, Text } from "@react-email/components";
import { emailConfig } from "./config";
import { MailTemplate } from "./template";

type Props = {
  scrapeTitle: string | null;
  questions: number;
  topCategories: { name: string; count: number; avgScore?: number | null }[];
  startDate: Date;
  endDate: Date;
  topPages: { name: string; count: number }[];
  avgScore: number | null;
  helpfulAnswers: number | null;
  notHelpfulAnswers: number | null;
};

const defaultProps: Props = {
  scrapeTitle: "MyScrape",
  questions: 132,
  topCategories: [],
  startDate: new Date(),
  endDate: new Date(),
  avgScore: 0.1,
  helpfulAnswers: 4,
  notHelpfulAnswers: 2,
  topPages: [{ name: "https://www.google.com", count: 100 }],
};

export default function WeeklyEmail(props: Props) {
  props = { ...defaultProps, ...props };
  const items: string[] = [];

  items.push(`✅ ${props.questions} questions`);
  if (props.avgScore !== null) {
    items.push(
      `${props.avgScore >= 0.5 ? "✅" : "❌"} ${props.avgScore.toFixed(
        2
      )} avg score`
    );
  } else {
    items.push("✅ - avg score");
  }

  items.push(`👍 ${props.helpfulAnswers ?? 0} helpful answers`);
  items.push(`👎 ${props.notHelpfulAnswers ?? 0} not helpful answers`);

  return (
    <MailTemplate
      title="CrawlChat Weekly"
      preview="Your weekly update on your conversations and performance!"
      heading={`${props.scrapeTitle ? props.scrapeTitle + " - " : ""}Weekly`}
      icon="🗓️"
      text={`Here is the short summary of your AI answering engine performance for the time period of ${props.startDate.toLocaleDateString()} to ${props.endDate.toLocaleDateString()}.`}
      cta={{
        text: "View more details",
        href: `${emailConfig.baseUrl}/app`,
      }}
    >
      <Row style={{ marginBottom: "16px" }}>
        <Text style={{ margin: "0px", fontSize: "18px", fontWeight: "bold" }}>
          Summary
        </Text>
        <ul
          style={{
            marginTop: "8px",
            padding: "0px",
            fontSize: "16px",
            listStyleType: "none",
          }}
        >
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Row>

      <Row style={{ marginBottom: "16px" }}>
        <Text style={{ margin: "0px", fontSize: "18px", fontWeight: "bold" }}>
          Top categories
        </Text>

        <ul
          style={{
            marginTop: "8px",
            padding: "0px",
            fontSize: "16px",
            listStyleType: "none",
          }}
        >
          {props.topCategories?.map((category) => (
            <li key={category.name}>
              📁 {category.name} [{category.count} questions,{" "}
              {category.avgScore ? category.avgScore.toFixed(2) : "-"} avg
              score]
            </li>
          ))}
          {(!props.topCategories || props.topCategories.length === 0) && (
            <li>No categories yet! Add categories to get started.</li>
          )}
        </ul>
      </Row>

      {props.topPages.length > 0 && (
        <Row style={{ marginBottom: "16px" }}>
          <Text style={{ margin: "0px", fontSize: "18px", fontWeight: "bold" }}>
            Top cited pages
          </Text>

          <ul
            style={{
              marginTop: "8px",
              padding: "0px",
              fontSize: "16px",
              listStyleType: "none",
            }}
          >
            {props.topPages?.map((page) => (
              <li key={page.name}>
                📄 {page.name} [{page.count}]
              </li>
            ))}
          </ul>
        </Row>
      )}
    </MailTemplate>
  );
}
