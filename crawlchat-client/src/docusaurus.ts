import { useEffect } from "react";

const iframeId = "crawlchat-iframe";

export function useCrawlChatSidePanel({
  history,
}: {
  history: { push: (path: string) => void };
}) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "internal-link-click") {
          const url = new URL(data.url);
          history.push(url.pathname);
        }
        if (data.type === "embed-ready") {
          postMessage(
            JSON.stringify({
              type: "internal-link-host",
              host: window.location.host,
            })
          );

          handleThemeChange();
        }
      } catch {}
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          handleThemeChange();
        }
      }
    });

    observer.observe(htmlElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const postMessage = (message: string) => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    iframe?.contentWindow?.postMessage(message, "*");
  };

  const handleThemeChange = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    postMessage(currentTheme === "dark" ? "dark-mode" : "light-mode");
  };
}
