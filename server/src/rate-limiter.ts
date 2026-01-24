import { RateLimiter } from "@packages/common/rate-limiter";

export const wsRateLimiter = new RateLimiter(30, "ws");
export const draftRateLimiter = new RateLimiter(20, "draft");
export const mcpRateLimiter = new RateLimiter(40, "mcp");
