class CrawlChatEmbed {
  constructor() {
    this.transitionDuration = 100;
    this.embedDivId = "crawlchat-embed";
    this.iframeId = "crawlchat-iframe";
    this.scriptId = "crawlchat-script";
    this.host = "https://crawlchat.app";
    this.scrapeId = this.getScrapeId();
    this.askAIButtonId = "crawlchat-ask-ai-button";
    this.lastScrollTop = 0;
    this.lastBodyStyle = {};
    this.widgetConfig = {};
    this.buttonWidth = 0;
    this.buttonHeight = 0;
    this.sidepanelWidth = 400;
    this.sidepanelId = "crawlchat-sidepanel";
  }

  getCustomTags() {
    const script = document.getElementById(this.scriptId);
    const allTags = script
      .getAttributeNames()
      .filter((name) => name.startsWith("data-tag-"))
      .map((name) => [
        name.replace("data-tag-", ""),
        script.getAttribute(name),
      ]);
    return Object.fromEntries(allTags);
  }

  async mount() {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = `${this.host}/embed.css`;
    document.head.appendChild(style);

    const iframe = document.createElement("iframe");
    iframe.id = this.iframeId;

    const params = new URLSearchParams({
      embed: "true",
    });
    const customTags = this.getCustomTags();
    if (Object.keys(customTags).length > 0) {
      params.set("tags", btoa(JSON.stringify(customTags)));
    }
    if (window.innerWidth < 700) {
      params.set("width", window.innerWidth.toString() + "px");
      params.set("height", window.innerHeight.toString() + "px");
      params.set("fullscreen", "true");
    }
    const src = `${this.host}/w/${this.scrapeId}?${params.toString()}`;

    iframe.src = src;
    iframe.allowTransparency = "true";
    iframe.allow = "clipboard-write";
    iframe.className = "crawlchat-embed";

    const div = document.createElement("div");
    div.id = this.embedDivId;

    div.appendChild(iframe);
    document.body.appendChild(div);
    window.addEventListener("message", (e) => this.handleOnMessage(e));

    // sidepanel
    this.mountSidePanel();
  }

  getScrapeId() {
    const script = document.getElementById(this.scriptId);
    return script?.getAttribute("data-id");
  }

  show() {
    const div = document.getElementById(this.embedDivId);
    div.classList.add("open");

    this.lastScrollTop = window.scrollY;
    this.lastBodyStyle = document.body.style;
    document.body.style.position = "fixed";
    document.body.style.overflowY = "scroll";
    document.body.style.width = "100%";
    document.body.style.top = `-${this.lastScrollTop}px`;

    const iframe = document.getElementById(this.iframeId);
    iframe.contentWindow.postMessage("focus", "*");
  }

  async hide() {
    document.body.style = this.lastBodyStyle;
    window.scrollTo(0, this.lastScrollTop);

    const div = document.getElementById(this.embedDivId);
    div.classList.remove("open");
    setTimeout(() => {
      window.focus();
    }, this.transitionDuration);

    await this.showAskAIButton();
  }

  isWidgetOpen() {
    const div = document.getElementById(this.embedDivId);
    return div.style.width === "100%";
  }

  async handleOnMessage(event) {
    if (event.data === "close") {
      window.crawlchatEmbed.hideSidePanel();
      return window.crawlchatEmbed.hide();
    }
    if (event.origin !== this.host) {
      return;
    }
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (data.type === "embed-ready") {
      this.widgetConfig = data.widgetConfig;
      await this.showAskAIButton();
    }
    if (data.type === "ask-ai-button") {
      this.buttonWidth = data.width;
      this.buttonHeight = data.height;
      this.resizeAskAIButton();
    }
    if (data.type === "ask-ai-button-click") {
      this.show();
    }
  }

  hideAskAIButton() {
    const button = document.getElementById(this.askAIButtonId);
    button.classList.add("hidden");
  }

  resizeAskAIButton() {
    const iframe = document.querySelector(`#${this.askAIButtonId} iframe`);
    iframe.style.width = `${this.buttonWidth}px`;
    iframe.style.height = `${this.buttonHeight}px`;

    const div = document.getElementById(this.askAIButtonId);
    div.style.opacity = "1";
  }

  async showAskAIButton() {
    const script = document.getElementById(this.scriptId);

    if (!script || document.getElementById(this.askAIButtonId)) {
      return;
    }

    const div = document.createElement("div");
    div.id = this.askAIButtonId;
    div.style.opacity = "0";

    const iframe = document.createElement("iframe");
    iframe.src = `${this.host}/w/${this.scrapeId}/button`;
    iframe.allowTransparency = "true";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.width = "0px";
    iframe.height = "0px";
    div.appendChild(iframe);

    div.addEventListener("click", function () {
      window.crawlchatEmbed.show();
      div.classList.add("hidden");
    });

    document.body.appendChild(div);
  }

  makeTooltip(text) {
    const div = document.createElement("div");
    div.innerText = text;
    div.className = "tooltip";
    return div;
  }

  showSidePanel() {
    const root = document.getElementById("__docusaurus");
    if (!root) return;

    const screenWidth = window.innerWidth;
    const scrollbarWidth = 15;
    root.style.width = `${
      screenWidth - this.sidepanelWidth - scrollbarWidth
    }px`;
    root.style.overflowY = "auto";

    const sidepanel = document.getElementById(this.sidepanelId);
    sidepanel.classList.remove("hidden");
  }

  hideSidePanel() {
    const root = document.getElementById("__docusaurus");
    if (!root) return;
    root.style.width = "100%";

    const sidepanel = document.getElementById(this.sidepanelId);
    sidepanel.classList.add("hidden");
  }

  mountSidePanel() {
    const root = document.getElementById("__docusaurus");
    if (!root) return;

    root.style.width = `100%`;

    const sidepanel = document.createElement("div");
    sidepanel.id = this.sidepanelId;
    sidepanel.classList.add("hidden");
    sidepanel.style.width = `${this.sidepanelWidth}px`;

    const iframe = document.createElement("iframe");
    iframe.src = `${this.host}/w/${this.scrapeId}?embed=true&fullscreen=true&sidepanel=true`;
    iframe.allowTransparency = "true";
    iframe.allow = "clipboard-write";
    iframe.className = "crawlchat-embed";
    iframe.style.width = "100%";
    iframe.style.height = "100%";

    sidepanel.appendChild(iframe);

    document.body.appendChild(sidepanel);
  }
}

async function setupCrawlChat() {
  window.crawlchatEmbed = new CrawlChatEmbed();
  await window.crawlchatEmbed.mount();
}

if (document.readyState === "complete" || window.frameElement) {
  setupCrawlChat();
} else {
  window.addEventListener("load", setupCrawlChat);
}
