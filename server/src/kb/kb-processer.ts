import { OrderedSet } from "../scrape/ordered-set";

export type KbContent = {
  text: string;
  title?: string;
  metaTags?: Array<{ key: string; value: string }>;
  error?: string;
};

export interface KbProcesserListener {
  onBeforeStart: () => void;
  onComplete: () => void;
  onError: (path: string, error: unknown) => void;
  onContentAvailable: (path: string, content: KbContent) => Promise<void>;
}

export interface KbProcesser {
  start: () => Promise<void>;
}

export abstract class BaseKbProcesser implements KbProcesser {
  protected readonly pathSet: OrderedSet<string>;
  protected readonly contents: Record<string, KbContent>;

  constructor(
    protected readonly listener: KbProcesserListener,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
    }
  ) {
    this.contents = {};
    this.pathSet = new OrderedSet();
  }

  async onComplete() {
    this.listener.onComplete();
  }

  async onError(path: string, error: unknown) {
    this.listener.onError(path, error);
  }

  async assertCreditsAvailable() {
    if (await this.options.hasCredits()) {
      return true;
    }

    throw new Error("No credits");
  }

  async onContentAvailable(path: string, content: KbContent) {
    try {
      await this.listener.onContentAvailable(path, content);
    } catch (error) {
      this.contents[path] = {
        metaTags: [],
        text: "ERROR",
      };
      await this.onError(path, error);
    }
  }

  abstract process(): Promise<void>;

  async start() {
    await this.assertCreditsAvailable();

    await this.process();

    await this.onComplete();
  }
}
