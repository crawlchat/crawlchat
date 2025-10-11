export function CrawlChatScript({
  id,
  sidePanel,
  src,
  hideAskAI,
  sidePanelOpen,
}: {
  id: string;
  sidePanel?: boolean;
  src?: string;
  hideAskAI?: boolean;
  sidePanelOpen?: boolean;
}) {
  return (
    <script
      src={src ?? "https://crawlchat.app/embed.js"}
      async
      id="crawlchat-script"
      data-id={id}
      data-sidepanel={sidePanel}
      data-hide-ask-ai={hideAskAI}
      data-sidepanel-open={sidePanelOpen}
    />
  );
}
