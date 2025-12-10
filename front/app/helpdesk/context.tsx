import { createContext, useEffect, useState } from "react";
import type { HelpdeskConfig } from "libs/prisma";

export function useHelpdesk({ config }: { config: HelpdeskConfig }) {
  const [chatActive, setChatActive] = useState(false);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data === "close") {
        setChatActive(false);
      }
    });
  }, []);

  return {
    chatActive,
    setChatActive,
    config,
  };
}

export const HelpdeskContext = createContext<ReturnType<typeof useHelpdesk>>(
  null!
);

export function HelpdeskProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: HelpdeskConfig;
}) {
  const helpdesk = useHelpdesk({ config });

  return (
    <HelpdeskContext.Provider value={helpdesk}>
      {children}
    </HelpdeskContext.Provider>
  );
}
