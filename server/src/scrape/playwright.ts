import { chromium, Page } from "playwright";

let page: Page | null = null;

async function getPage() {
  if (!page) {
    const browser = await chromium.launch();
    page = await browser.newPage();
  }
  return page;
}

export async function scrapePw(
  url: string,
  options?: { scrollSelector?: string }
) {
  const page = await getPage();
  console.log("Navigating to", url);
  await page.goto(url);
  await page.waitForLoadState("networkidle");

  const scrollSelector = options?.scrollSelector;

  let previousHeight = 0;
  for (let i = 0; i < 10; i++) {
    console.log(`Scroll iteration ${i + 1}/10`);

    if (!scrollSelector) {
      break;
    }

    const currentHeight = await page.evaluate(
      (selector) => document.querySelector(selector)?.scrollHeight ?? 0,
      scrollSelector
    );

    if (i > 0 && currentHeight === previousHeight) {
      console.log("No new content loaded, stopping scroll");
      break;
    }

    previousHeight = currentHeight;
    await page.evaluate((selector) => {
      const scrollElement = document.querySelector(selector);
      if (!scrollElement) {
        return;
      }
      scrollElement.scrollTo(0, scrollElement.scrollHeight);
    }, scrollSelector);

    console.log("Waiting for networkidle after scroll");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  }

  console.log("Getting html");
  const html = await page.content();
  return html;
}
