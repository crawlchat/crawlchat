import { verify, sign, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "./prisma";
import { Prisma, ScrapeUser } from "libs/prisma";

interface UserPayload extends JwtPayload {
  userId: string;
}

export function verifyToken(token: string): UserPayload {
  return verify(token, process.env.JWT_SECRET!) as UserPayload;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        scrapeUsers: true,
      },
    });
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: Prisma.UserGetPayload<{
        include: {
          scrapeUsers: true;
        };
      }>;
    }
  }
}

export function authoriseScrapeUser(
  scrapeUsers: ScrapeUser[],
  scrapeId: string
) {
  if (!scrapeUsers.find((su) => su.scrapeId === scrapeId)) {
    throw new Error("Unauthorised");
  }
}

export function createToken(
  userId: string,
  options?: { expiresInSeconds?: number }
) {
  const expiresInSeconds = options?.expiresInSeconds ?? 60;
  return sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: `${expiresInSeconds}s`,
  });
}
