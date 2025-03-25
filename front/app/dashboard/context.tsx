import type { User } from "libs/prisma";
import { createContext, useState } from "react";

export const useApp = ({
  user,
  scrapeId,
}: {
  user: User;
  scrapeId?: string;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>();

  return {
    user,
    menuOpen,
    setMenuOpen,
    containerWidth,
    setContainerWidth,
    scrapeId,
  };
};

export const AppContext = createContext({} as ReturnType<typeof useApp>);
