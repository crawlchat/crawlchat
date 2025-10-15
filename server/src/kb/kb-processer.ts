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

export type KbProcesserListener = {
  onBeforeStart: () => Promise<void>;
  onComplete: (error?: string) => Promise<void>;
  onError: (path: string, error: unknown) => Promise<void>;
  onContentAvailable: (path: string, content: KbContent) => Promise<void>;
};

export interface KbProcesser {
  start: () => Promise<void>;
}

export abstract class BaseKbProcesser implements KbProcesser {
  constructor(protected readonly listener: KbProcesserListener) {}

  async onComplete() {
    await this.listener.onComplete();
  }

  async onBeforeStart() {
    await this.listener.onBeforeStart();
  }

  async onError(path: string, error: unknown) {
    await this.listener.onError(path, error);
  }

  async onContentAvailable(path: string, content: KbContent) {
    await this.listener.onContentAvailable(path, content);
  }

  abstract process(): Promise<void>;

  async start() {
    await this.onBeforeStart();
    await this.process();
    await this.onComplete();
  }
}
