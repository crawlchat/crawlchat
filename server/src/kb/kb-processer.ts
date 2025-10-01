export type KbContent = {
  text: string;
  title?: string;
  metaTags?: Array<{ key: string; value: string }>;
  error?: string;
};

export type KbProcessProgress = {
  remaining: number;
  completed: number;
};

export interface KbProcesserListener {
  onBeforeStart: () => Promise<void>;
  onComplete: () => Promise<void>;
  onError: (path: string, error: unknown) => Promise<void>;
  onContentAvailable: (
    path: string,
    content: KbContent,
    progress: KbProcessProgress
  ) => Promise<void>;
}

export interface KbProcesser {
  start: () => Promise<void>;
}

export abstract class BaseKbProcesser implements KbProcesser {
  constructor(
    protected readonly listener: KbProcesserListener,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
    }
  ) {}

  async onComplete() {
    await this.listener.onComplete();
  }

  async onBeforeStart() {
    await this.listener.onBeforeStart();
  }

  async onError(path: string, error: unknown) {
    await this.listener.onError(path, error);
  }

  async assertCreditsAvailable() {
    if (await this.options.hasCredits()) {
      return true;
    }

    throw new Error("No credits");
  }

  async onContentAvailable(
    path: string,
    content: KbContent,
    progress: KbProcessProgress
  ) {
    try {
      await this.listener.onContentAvailable(path, content, progress);
    } catch (error) {
      await this.onError(path, error);
      if (error instanceof Error && error.message === "Not enough credits") {
        await this.onComplete();
      }
    }
  }

  abstract process(): Promise<void>;

  async start() {
    await this.onBeforeStart();
    await this.process();
    await this.onComplete();
  }
}
