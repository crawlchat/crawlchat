class RateLimiter {
  private readonly everyMs: number;
  private till: number;

  constructor(rpm: number) {
    this.till = new Date().getTime();
    this.everyMs = (1000 / rpm) * 60;
  }

  getWaitMs() {
    this.till += this.everyMs;

    const now = new Date().getTime();
    return Math.max(0, this.till - now);
  }

  async wait() {
    const waitMs = this.getWaitMs();
    if (waitMs > 0) {
      await wait(waitMs);
    }
  }
}

export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const limiters = {
  "github-api": new RateLimiter(20),
};

export function getLimiter(key: keyof typeof limiters) {
  return limiters[key];
}
