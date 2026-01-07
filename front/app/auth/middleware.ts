import type { Prisma, User } from "libs/prisma";
import { redirect } from "react-router";
import { prisma } from "libs/prisma";
import { getSession } from "~/session";

export async function getAuthUser(
  request: Request,
  options?: { redirectTo?: string; dontRedirect?: boolean; userId?: string }
) {
  const redirectTo = options?.redirectTo ?? "/login";

  const session = await getSession(request.headers.get("cookie"));
  const sessionUser = session.get("user");

  if (!sessionUser && !options?.dontRedirect) {
    throw redirect(redirectTo);
  }

  if (options?.userId && sessionUser?.id !== options.userId) {
    throw redirect(redirectTo, {
      status: 403,
    });
  }

  let user: Prisma.UserGetPayload<{
    include: {
      scrapeUsers: true;
    };
  }> | null = null;
  if (sessionUser) {
    const t1 = performance.now();
    user = await prisma.user.findUnique({
      where: { id: sessionUser?.id },
      include: {
        scrapeUsers: true,
      },
    });
    const t2 = performance.now();
    console.log(`Time taken for session user fetch: ${t2 - t1}ms`);
  }

  return user;
}
