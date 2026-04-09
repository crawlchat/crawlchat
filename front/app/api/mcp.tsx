import cn from "@meltdownjs/cn";
import { useContext, type PropsWithChildren } from "react";
import { toast } from "react-hot-toast";
import { TbCopy, TbInfoCircle, TbKey } from "react-icons/tb";
import { Link } from "react-router";
import { AppContext } from "~/components/app-context";
import { MCPIcon } from "~/components/mcp-icon";
import { Page } from "~/components/page";
import {
  SettingsContainer,
  SettingsSection,
  SettingsSectionProvider,
} from "~/components/settings-section";
import { makeMeta } from "~/meta";

const code = `{
  "name": "CrawlChat",
  "url": "https://wings.crawlchat.app/mcp",
  "headers": {
    "x-api-key": "YOUR_API_KEY"
  }
}`;

export function meta() {
  return makeMeta({
    title: "Collection MCP",
    description: "MCP server for your collection.",
  });
}

function ToolName({ children }: PropsWithChildren) {
  return (
    <code className="bg-base-100 px-1 rounded-box border border-base-300">
      {children}
    </code>
  );
}

export default function ApiMcp() {
  const { scrape } = useContext(AppContext);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  }

  return (
    <Page title="Collection MCP" icon={<MCPIcon />}>
      <div className="flex flex-col gap-4">
        <SettingsSectionProvider>
          <SettingsContainer>
            <div role="alert" className="alert alert-info alert-soft">
              <TbInfoCircle />
              <span>
                Go to{" "}
                <Link to="/connect/mcp-server" className="link">
                  Connect &gt; MCP server
                </Link>{" "}
                if you are looking for MCP server for your documentation
              </span>
            </div>

            <p>
              You can connect your{" "}
              <span className="font-semibold text-primary">
                {scrape?.title}
              </span>{" "}
              collection to your AI tools like Cursor, Claude App, etc. as an
              MCP server.
            </p>

            <p>
              The MCP server provides following tools:
              <ul
                className={cn(
                  "list-disc list-inside mt-2",
                  "flex flex-col gap-1"
                )}
              >
                <li>
                  <ToolName>get_user</ToolName> - Returns authenticated user
                  details
                </li>
                <li>
                  <ToolName>get_collections</ToolName> - Lists collections
                  available to the user
                </li>
                <li>
                  <ToolName>get_groups</ToolName> - Lists knowledge groups in a
                  collection
                </li>
                <li>
                  <ToolName>get_data_gaps</ToolName> - Returns recent unresolved
                  data gaps for a collection
                </li>
                <li>
                  <ToolName>get_messages</ToolName> - Returns paginated recent
                  messages for a collection
                </li>
                <li>
                  <ToolName>get_summary</ToolName> - Returns summary analytics
                  for a date range
                </li>
                <li>
                  <ToolName>set_ai_model</ToolName> - Updates AI model for a
                  collection
                </li>
                <li>
                  <ToolName>set_collection_visibility</ToolName> - Sets
                  collection public/private visibility
                </li>
                <li>
                  <ToolName>set_prompt</ToolName> - Updates the chat prompt for
                  a collection
                </li>
                <li>More to be added!</li>
              </ul>
            </p>

            <SettingsSection
              id="install"
              title="Install MCP Server"
              description={
                "Instructions to install MCP server in your AI tools"
              }
              actionRight={
                <>
                  <Link to="/api/keys" className="btn btn-primary btn-soft">
                    <TbKey /> Get API Key
                  </Link>
                  <button className="btn btn-primary" onClick={handleCopy}>
                    <TbCopy />
                    Copy
                  </button>
                </>
              }
            >
              <div className="prose">
                <pre>{code}</pre>
              </div>
            </SettingsSection>
          </SettingsContainer>
        </SettingsSectionProvider>
      </div>
    </Page>
  );
}
