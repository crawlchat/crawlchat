import { createContext, useEffect, useState } from "react";

export function useHelpdesk() {
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
  };
}

export const HelpdeskContext = createContext<ReturnType<typeof useHelpdesk>>(
  null!
);

export function HelpdeskProvider({ children }: { children: React.ReactNode }) {
  const helpdesk = useHelpdesk();

  return (
    <HelpdeskContext.Provider value={helpdesk}>
      {children}
    </HelpdeskContext.Provider>
  );
}
