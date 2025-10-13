import { useState, useContext } from "react";
import { createRoot } from "react-dom/client";
import { TbCheck, TbLogout, TbX } from "react-icons/tb";
import { PopupContext, usePopup } from "./context";

function Welcome() {
  const { setConfig } = useContext(PopupContext);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setConfig((c) => {
        if (c) {
          return { ...c, apiKey: apiKeyInput.trim() };
        }
        return { apiKey: apiKeyInput.trim(), scrapeId: null, chatPrompt: null };
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend pt-0">API Key</legend>
            <input
              type="password"
              className="input"
              placeholder="Ex: 2839-df39-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveApiKey()}
            />
          </fieldset>
        </div>
      </div>
      <button
        onClick={handleSaveApiKey}
        disabled={!apiKeyInput.trim()}
        className="btn btn-primary w-full"
      >
        <TbCheck className="h-4 w-4" />
        Save API Key
      </button>
    </div>
  );
}

function Home() {
  const { setConfig, scrapes, config } = useContext(PopupContext);

  function handleChangeScrape(scrapeId: string) {
    setConfig((c) => (c ? { ...c, scrapeId } : c));
  }

  function handleChangeChatPrompt(chatPrompt: string) {
    setConfig((c) => (c ? { ...c, chatPrompt } : c));
  }

  return (
    <div
      className="space-y-3"
      style={{ minHeight: scrapes ? scrapes.length * 44 : undefined }}
    >
      <div className="bg-base-200 shadow-sm p-4 rounded-box">
        <fieldset className="fieldset">
          <legend className="fieldset-legend pt-0">Collection</legend>
          <select
            value={
              scrapes === undefined ? "loading" : config?.scrapeId ?? undefined
            }
            className="select"
            onChange={(e) => handleChangeScrape(e.target.value)}
          >
            {scrapes === undefined && (
              <option value={"loading"}>Loading</option>
            )}
            {scrapes?.map((scrape) => (
              <option key={scrape.collectionId} value={scrape.collectionId}>
                {scrape.collectionName}
              </option>
            ))}
          </select>
        </fieldset>
      </div>

      <div className="bg-base-200 shadow-sm p-4 rounded-box">
        <fieldset className="fieldset">
          <legend className="fieldset-legend pt-0">Compose prompt</legend>
          <textarea
            className="textarea w-full"
            rows={3}
            placeholder="Add your prompt for this plugin compose here"
            value={config?.chatPrompt ?? ""}
            onChange={(e) => handleChangeChatPrompt(e.target.value)}
          />
        </fieldset>
      </div>

      <div className="text-center text-base-content/50">
        You can use tools such as compose from any page from the above
        configured collection.
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={() => setConfig(null)}
          className="btn btn-error btn-soft"
        >
          Logout
          <TbLogout />
        </button>
      </div>
    </div>
  );
}

const Popup = () => {
  const context = usePopup();

  return (
    <PopupContext.Provider value={context}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-1">
          <img src="logo.png" alt="CrawlChat" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-base-content">CrawlChat</h1>
        </div>

        {!context.config?.apiKey ? <Welcome /> : <Home />}
      </div>
    </PopupContext.Provider>
  );
};

const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
