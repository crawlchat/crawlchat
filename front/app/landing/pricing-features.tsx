import { SiConfluence, SiLinear, SiN8N } from "react-icons/si";
import {
  TbBrandChrome,
  TbBrandDiscord,
  TbBrandGithub,
  TbBrandNotion,
  TbBrandSlack,
  TbChartArea,
  TbChartBarOff,
  TbClock,
  TbCode,
  TbCoins,
  TbFile,
  TbFolder,
  TbMail,
  TbMoodSmile,
  TbPencil,
  TbPointer,
  TbQuestionMark,
  TbRobotFace,
  TbSearch,
  TbShieldCheck,
  TbTicket,
  TbUser,
  TbUsers,
} from "react-icons/tb";
import { MCPIcon } from "~/components/mcp-icon";
import {
  CompareTable,
  type CompareEntity,
  type CompareFeatureNames,
} from "./compare/table";

export type PricingFeature =
  | "api"
  | "discord_bot"
  | "slack_app"
  | "mcp_server"
  | "github_issues"
  | "notion"
  | "confluence"
  | "linear"
  | "n8n"
  | "analytics"
  | "categories"
  | "data_gaps"
  | "teams"
  | "support_tickets"
  | "private"
  | "sentiment_analysis"
  | "actions"
  | "compose"
  | "chrome_extension"
  | "email_reports"
  | "follow_up_questions"
  | "data_retention"
  | "hybrid_search"
  | "users"
  | "pages"
  | "credits"
  | "collections"
  | "collections_mcp";

export const pricingFeatureNames: CompareFeatureNames<PricingFeature> = {
  credits: {
    label: "Credits",
    icon: <TbCoins />,
    type: "plan",
    note: "Used for answering",
  },
  pages: {
    label: "Pages",
    icon: <TbFile />,
    type: "plan",
    note: "~8k charecters are considered as a page",
  },
  collections: {
    label: "Collections",
    icon: <TbRobotFace />,
    type: "plan",
    note: "Workspaces with bots",
  },

  discord_bot: {
    label: "Discord Bot",
    icon: <TbBrandDiscord />,
    type: "integrations",
  },
  api: { label: "API", icon: <TbCode />, type: "integrations" },
  slack_app: {
    label: "Slack App",
    icon: <TbBrandSlack />,
    type: "integrations",
  },
  mcp_server: { label: "MCP Server", icon: <MCPIcon />, type: "integrations" },
  n8n: {
    label: "n8n node",
    icon: <SiN8N />,
    type: "integrations",
    note: "Community node",
  },
  github_issues: {
    label: "GitHub Issues",
    icon: <TbBrandGithub />,
    type: "sources",
    note: "Issues and PRs",
  },
  notion: { label: "Notion Pages", icon: <TbBrandNotion />, type: "sources" },
  confluence: {
    label: "Confluence Pages",
    icon: <SiConfluence />,
    type: "sources",
  },
  linear: {
    label: "Linear Pages",
    icon: <SiLinear />,
    type: "sources",
    note: "Pages & Projects",
  },
  data_gaps: { label: "Data Gaps", icon: <TbChartBarOff />, type: "insights" },
  analytics: { label: "Analytics", icon: <TbChartArea />, type: "insights" },
  categories: { label: "Categories", icon: <TbFolder />, type: "insights" },
  sentiment_analysis: {
    label: "Sentiment Analysis",
    icon: <TbMoodSmile />,
    type: "insights",
  },

  teams: { label: "Teams", icon: <TbUsers />, type: "features" },
  support_tickets: {
    label: "Support Tickets",
    icon: <TbTicket />,
    type: "features",
  },

  actions: { label: "Actions", icon: <TbPointer />, type: "features" },
  email_reports: {
    label: "Email Reports",
    icon: <TbMail />,
    type: "features",
    note: "Weekly reports",
  },
  follow_up_questions: {
    label: "Follow up Questions",
    icon: <TbQuestionMark />,
    type: "features",
    note: "On web widget",
  },
  users: { label: "Users View", icon: <TbUser />, type: "features" },
  collections_mcp: {
    label: "Collections MCP",
    note: "View & manage your collections",
    icon: <MCPIcon />,
    type: "features",
  },

  compose: { label: "Compose", icon: <TbPencil />, type: "tools" },
  chrome_extension: {
    label: "Chrome Extension",
    icon: <TbBrandChrome />,
    type: "tools",
    note: "Compose answers anywhere",
  },

  data_retention: {
    label: "Data Retention",
    icon: <TbClock />,
    type: "security",
  },
  private: { label: "Private Bots", icon: <TbShieldCheck />, type: "security" },

  hybrid_search: {
    label: "Hybrid Search",
    icon: <TbSearch />,
    type: "technology",
  },
};

export const launchPlan: CompareEntity<PricingFeature> = {
  name: "Launch",
  url: "https://crawlchat.app",
  features: {
    pages: {
      value: "2k",
    },
    credits: {
      value: "800",
      lable: "per month",
    },
    collections: {
      value: "1",
    },
    api: {
      value: true,
    },
    discord_bot: {
      value: true,
    },
    slack_app: {
      value: true,
    },
    mcp_server: {
      value: true,
    },
    github_issues: {
      value: true,
    },
    notion: {
      value: true,
    },
    confluence: {
      value: true,
    },
    linear: {
      value: true,
    },
    n8n: {
      value: true,
    },
    analytics: {
      value: "Basic",
    },
    categories: {
      value: false,
    },
    data_gaps: {
      value: false,
    },
    teams: {
      value: "1 member",
    },
    support_tickets: {
      value: true,
    },
    private: {
      value: true,
    },
    sentiment_analysis: {
      value: false,
    },
    actions: {
      value: true,
    },
    compose: {
      value: true,
    },
    chrome_extension: {
      value: true,
    },
    email_reports: {
      value: true,
    },
    follow_up_questions: {
      value: true,
    },
    data_retention: {
      value: "6 months",
    },
    hybrid_search: {
      value: true,
    },
    users: {
      value: true,
    },
    collections_mcp: {
      value: false,
    },
  },
};

export const growPlan: CompareEntity<PricingFeature> = {
  name: "Grow",
  url: "https://crawlchat.app",
  features: {
    pages: {
      value: "5k",
    },
    credits: {
      value: "2000",
      lable: "per month",
    },
    collections: {
      value: "2",
    },
    api: {
      value: true,
    },
    discord_bot: {
      value: true,
    },
    slack_app: {
      value: true,
    },
    mcp_server: {
      value: true,
    },
    github_issues: {
      value: true,
    },
    notion: {
      value: true,
    },
    confluence: {
      value: true,
    },
    linear: {
      value: true,
    },
    n8n: {
      value: true,
    },
    analytics: {
      value: "Best",
    },
    categories: {
      value: true,
    },
    data_gaps: {
      value: true,
    },
    teams: {
      value: "2 members",
    },
    support_tickets: {
      value: true,
    },
    private: {
      value: true,
    },
    sentiment_analysis: {
      value: true,
    },
    actions: {
      value: true,
    },
    compose: {
      value: true,
    },
    chrome_extension: {
      value: true,
    },
    email_reports: {
      value: true,
    },
    follow_up_questions: {
      value: true,
    },
    data_retention: {
      value: "1 year",
    },
    hybrid_search: {
      value: true,
    },
    users: {
      value: true,
    },
    collections_mcp: {
      value: false,
    },
  },
};

export const acceleratePlan: CompareEntity<PricingFeature> = {
  name: "Accelerate",
  url: "https://crawlchat.app",
  features: {
    pages: {
      value: "14k",
    },
    credits: {
      value: "7000",
      lable: "per month",
    },
    collections: {
      value: "3",
    },
    api: {
      value: true,
    },
    discord_bot: {
      value: true,
    },
    slack_app: {
      value: true,
    },
    mcp_server: {
      value: true,
    },
    github_issues: {
      value: true,
    },
    notion: {
      value: true,
    },
    confluence: {
      value: true,
    },
    linear: {
      value: true,
    },
    n8n: {
      value: true,
    },
    analytics: {
      value: "Best",
    },
    categories: {
      value: true,
    },
    data_gaps: {
      value: true,
    },
    teams: {
      value: "5 members",
    },
    support_tickets: {
      value: true,
    },
    private: {
      value: true,
    },
    sentiment_analysis: {
      value: true,
    },
    actions: {
      value: true,
    },
    compose: {
      value: true,
    },
    chrome_extension: {
      value: true,
    },
    email_reports: {
      value: true,
    },
    follow_up_questions: {
      value: true,
    },
    data_retention: {
      value: "1 year",
    },
    hybrid_search: {
      value: true,
    },
    users: {
      value: true,
    },
    collections_mcp: {
      value: true,
    },
  },
};

export function PricingFeatureComparison() {
  return (
    <CompareTable
      names={pricingFeatureNames}
      comparison={[launchPlan, growPlan, acceleratePlan]}
      size="lg"
    />
  );
}
