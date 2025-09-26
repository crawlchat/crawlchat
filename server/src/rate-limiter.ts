import { RateLimiter } from "libs/rate-limiter";

export const githubApiRateLimiter = new RateLimiter(20, "github-api");
export const wsRateLimiter = new RateLimiter(30, "ws");
export const draftRateLimiter = new RateLimiter(20, "draft");
export const mcpRateLimiter = new RateLimiter(40, "mcp");

