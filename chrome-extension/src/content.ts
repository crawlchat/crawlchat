import React from "react";
import { createRoot } from "react-dom/client";
import Modal from "./modal";
import { Config } from "./config";

function injectShadowStyles(shadowRoot: ShadowRoot): void {
  chrome.runtime.sendMessage({ type: "GET_INJECT_CSS" }, (response) => {
    if (response && response.css) {
      const style = document.createElement("style");
      style.textContent = response.css;
      shadowRoot.appendChild(style);
    }
  });
}

function injectStickyButtonCSS(): void {
  chrome.runtime.sendMessage({ type: "GET_STICKY_BUTTON_CSS" }, (response) => {
    if (response && response.css) {
      const style = document.createElement("style");
      style.id = "crawlchat-sticky-button-styles";
      style.textContent = response.css;
      document.head.appendChild(style);
    }
  });
}

async function getConfig(): Promise<Config | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["crawlchatConfig"], (result) => {
      resolve(result ? JSON.parse(result.crawlchatConfig) : null);
    });
  });
}

let globalButton: HTMLElement | null = null;
let latestFocusedElement:
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLElement
  | null = null;
let blurTimeoutId: number | null = null;

function createGlobalButton(): void {
  if (globalButton) return;

  injectStickyButtonCSS();

  globalButton = document.createElement("button");
  globalButton.className = "crawlchat-sticky-btn";
  globalButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  `;

  globalButton.addEventListener("click", async (e) => {
    console.log("Global button clicked!");
    e.preventDefault();
    e.stopPropagation();

    const targetElement =
      latestFocusedElement ||
      (document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLElement);

    const config = await getConfig();

    if (config && config.apiKey && config.scrapeId) {
      openModal(config, targetElement);
    }
  });

  document.body.appendChild(globalButton);
}

function listenInput(
  inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement
): void {
  if (inputElement.dataset.crawlchatListener) {
    return;
  }

  inputElement.dataset.crawlchatListener = "true";

  inputElement.addEventListener("focus", () => {
    latestFocusedElement = inputElement;
    if (globalButton) {
      globalButton.classList.add("active");
    }
    if (blurTimeoutId !== null) {
      clearTimeout(blurTimeoutId);
      blurTimeoutId = null;
    }
  });

  inputElement.addEventListener("blur", () => {
    if (blurTimeoutId !== null) {
      clearTimeout(blurTimeoutId);
    }
    blurTimeoutId = window.setTimeout(() => {
      if (globalButton) {
        globalButton.classList.remove("active");
      }
      blurTimeoutId = null;
    }, 150);
  });
}

function watchForInputs(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          if (
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA" ||
            (element as HTMLElement).contentEditable === "true"
          ) {
            listenInput(
              element as HTMLInputElement | HTMLTextAreaElement | HTMLElement
            );
          }

          const inputs = element.querySelectorAll(
            'input, textarea, [contenteditable="true"]'
          );
          inputs.forEach((input) => {
            listenInput(
              input as HTMLInputElement | HTMLTextAreaElement | HTMLElement
            );
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function addButtonsToExistingInputs(): void {
  const inputs = document.querySelectorAll(
    'input, textarea, [contenteditable="true"]'
  );

  inputs.forEach((input) => {
    listenInput(input as HTMLInputElement | HTMLTextAreaElement | HTMLElement);
  });
}

async function openModal(
  config: Config,
  inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  options?: {
    submit?: boolean;
    autoUse?: boolean;
  }
) {
  const existingModal = document.getElementById("crawlchat-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const shadowHost = document.createElement("div");
  shadowHost.id = "crawlchat-modal";
  shadowHost.style.position = "fixed";
  shadowHost.style.top = "0";
  shadowHost.style.left = "0";
  shadowHost.style.width = "100%";
  shadowHost.style.height = "100%";
  shadowHost.style.pointerEvents = "none";
  shadowHost.style.zIndex = "2147483647";

  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  const modalContainer = document.createElement("div");
  modalContainer.style.pointerEvents = "auto";
  shadowRoot.appendChild(modalContainer);

  injectShadowStyles(shadowRoot);

  document.body.appendChild(shadowHost);

  const currentValue =
    (inputElement as HTMLInputElement | HTMLTextAreaElement).value ||
    (inputElement as HTMLElement).textContent ||
    (inputElement as HTMLElement).innerText ||
    "";

  const root = createRoot(modalContainer);

  const handleClose = () => {
    closeModal(shadowHost);
  };

  const handleUse = (content: string) => {
    if (latestFocusedElement) {
      if (
        latestFocusedElement instanceof HTMLInputElement ||
        latestFocusedElement instanceof HTMLTextAreaElement
      ) {
        latestFocusedElement.value = content;
      } else {
        latestFocusedElement.innerHTML = content.replace(/\n/g, '<br>');
      }
      latestFocusedElement.focus();
      closeModal(shadowHost);
      setTimeout(() => {
        if (latestFocusedElement) {
          latestFocusedElement.focus();
        }
      }, 100);
    }
  };

  root.render(
    React.createElement(Modal, {
      config,
      currentValue,
      onClose: handleClose,
      onUse: handleUse,
      submit: options?.submit,
      autoUse: options?.autoUse,
    })
  );

  setTimeout(() => {
    const modalOverlay = modalContainer.querySelector(
      "div[class*='fixed inset-0']"
    );
    if (modalOverlay) {
      modalOverlay.classList.remove("opacity-0");
      modalOverlay.classList.add("opacity-100");
      const modalContent = modalOverlay.querySelector(
        "div[class*='bg-white rounded-xl']"
      );
      if (modalContent) {
        modalContent.classList.remove("scale-95");
        modalContent.classList.add("scale-100");
      }
    }
  }, 10);
}

function closeModal(shadowHost: HTMLElement): void {
  const shadowRoot = shadowHost.shadowRoot;
  if (shadowRoot) {
    const modalContainer = shadowRoot.firstElementChild as HTMLElement;
    if (modalContainer) {
      const modalOverlay = modalContainer.querySelector(
        "div[class*='fixed inset-0']"
      );
      if (modalOverlay) {
        modalOverlay.classList.remove("opacity-100");
        modalOverlay.classList.add("opacity-0");
        const modalContent = modalOverlay.querySelector(
          "div[class*='bg-white rounded-xl']"
        );
        if (modalContent) {
          modalContent.classList.remove("scale-100");
          modalContent.classList.add("scale-95");
        }
      }
    }
  }
  setTimeout(() => {
    if (shadowHost.parentNode) {
      shadowHost.parentNode.removeChild(shadowHost);
    }
    if (latestFocusedElement) {
      latestFocusedElement.focus();
    }
  }, 300);
}

function handleModalAction(action: string | undefined): void {
  if (!action) return;

  const shadowHost = document.getElementById("crawlchat-modal");
  if (shadowHost) {
    closeModal(shadowHost);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeExtension();
  });
} else {
  initializeExtension();
}

function initializeExtension(): void {
  createGlobalButton();

  addButtonsToExistingInputs();
  watchForInputs();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_INFO") {
    sendResponse({
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
    });
  }

  if (message.type === "OPEN_MODAL_FROM_SHORTCUT") {
    handleShortcutOpenModal();
  }

  if (message.type === "OPEN_MODAL_AUTO_USE_FROM_SHORTCUT") {
    handleShortcutOpenModalAutoUse();
  }
});

async function handleShortcutOpenModal() {
  const config = await getConfig();

  if (config && config.apiKey && config.scrapeId) {
    const targetElement =
      latestFocusedElement ||
      (document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLElement);

    openModal(config, targetElement, { submit: true });
  }
}

async function handleShortcutOpenModalAutoUse() {
  const config = await getConfig();

  if (config && config.apiKey && config.scrapeId) {
    const targetElement =
      latestFocusedElement ||
      (document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLElement);

    openModal(config, targetElement, { submit: true, autoUse: true });
  }
}
