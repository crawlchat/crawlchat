import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { prisma, ScrapeUser } from "./prisma";

interface UserPayload extends JwtPayload {
  userId: string;
}

export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
}

export function createToken(
  userId: string,
  options?: { expiresInSeconds?: number }
) {
  const expiresInSeconds = options?.expiresInSeconds ?? 60;
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: `${expiresInSeconds}s`,
  });
}

export function authoriseScrapeUser(
  scrapeUsers: ScrapeUser[],
  scrapeId: string
) {
  if (!scrapeUsers.find((su) => su.scrapeId === scrapeId)) {
    throw new Error("Unauthorised");
  }
}

export async function getJwtAuthUser(token?: string | null) {
  if (!token) {
    throw Response.json({ error: "No token provided" }, { status: 401 });
  }

  const userPayload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
    include: {
      scrapeUsers: true,
    },
  });

  if (!user) {
    throw Response.json({ error: "Invalid token" }, { status: 401 });
  }

  return user;
}
