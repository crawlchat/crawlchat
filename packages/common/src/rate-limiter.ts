export class RateLimiter {
  private readonly rpm: number;
  private readonly everyMs: number;
  private readonly name: string;
  private till: number;
  private requestTimes: number[] = [];

  constructor(rpm: number, name: string) {
    this.rpm = rpm;
    this.name = name;
    this.till = new Date().getTime();
    this.everyMs = (1000 / rpm) * 60;
  }

  private cleanupOldRequests() {
    const oneMinuteAgo = new Date().getTime() - 60 * 1000;
    this.requestTimes = this.requestTimes.filter((time) => time > oneMinuteAgo);
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

  check() {
    this.cleanupOldRequests();

    if (this.requestTimes.length >= this.rpm) {
      throw new Error(`Rate limit ${this.name} exceeded: ${this.rpm} RPM`);
    }

    this.requestTimes.push(new Date().getTime());
  }
}

export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
