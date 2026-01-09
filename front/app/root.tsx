import type { Route } from "./+types/root";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useMatches,
} from "react-router";
import { useMemo } from "react";
import stylesheet from "./app.css?url";
import { crawlChatSchema } from "./landing/schema";

declare global {
  interface Window {
    ENV: {
      VITE_SERVER_WS_URL: string;
      VITE_SOURCE_SYNC_URL: string;
      VITE_DATAFAST_ID: string;
    };
  }
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Mynerve&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Dawning+of+a+New+Day&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function loader() {
  return {
    ENV: {
      VITE_SERVER_WS_URL: process.env.VITE_SERVER_WS_URL,
      VITE_SOURCE_SYNC_URL: process.env.VITE_SOURCE_SYNC_URL,
      VITE_DATAFAST_ID: process.env.VITE_DATAFAST_ID,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { ENV } = useLoaderData<typeof loader>();
  const location = useLocation();
  const matches = useMatches();
  const datafastId = useMemo(() => {
    if (/\/w\/[0-9a-fA-F]{24}/.test(location.pathname)) return null;
    return ENV.VITE_DATAFAST_ID;
  }, [location, ENV.VITE_DATAFAST_ID]);
  const isLandingPage = matches.some((match) => match.id === "landing/page");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-1.png" />
        {datafastId && (
          <script
            defer
            data-website-id={datafastId}
            data-domain="crawlchat.app"
            src="https://datafa.st/js/script.js"
          />
        )}
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(crawlChatSchema),
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {isLandingPage && (
          <script
            src="/embed.js"
            id="crawlchat-script"
            data-id="crawlchat"
            data-ask-ai="true"
          />
        )}
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Outlet />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
        }}
      />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
