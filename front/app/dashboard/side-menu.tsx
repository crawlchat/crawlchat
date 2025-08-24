import {
  TbArrowDown,
  TbArrowRight,
  TbBook,
  TbChartBarOff,
  TbChevronDown,
  TbChevronUp,
  TbCreditCard,
  TbCrown,
  TbHome,
  TbLock,
  TbLogout,
  TbMessage,
  TbPlug,
  TbPointer,
  TbSettings,
  TbThumbDown,
  TbTicket,
  TbUser,
  TbUsers,
  TbWorld,
  TbX,
} from "react-icons/tb";
import {
  Link,
  NavLink,
  useFetcher,
  type FetcherWithComponents,
} from "react-router";
import type { Scrape, User } from "libs/prisma";
import type { Plan } from "libs/user-plan";
import { numberToKMB } from "~/number-util";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  getPendingActions,
  getSkippedActions,
  setSkippedActions,
  type SetupProgressInput,
} from "./setup-progress";
import { LogoChakra } from "./logo-chakra";
import { AppContext } from "./context";
import { track } from "~/pirsch";
import cn from "@meltdownjs/cn";

function SideMenuItem({
  link,
  number,
}: {
  link: {
    label: string;
    to: string;
    icon: React.ReactNode;
    external?: boolean;
  };
  number?: {
    value: number;
    color?: string;
    icon?: React.ReactNode;
  };
}) {
  return (
    <NavLink to={link.to} target={link.external ? "_blank" : undefined}>
      {({ isPending, isActive }) => (
        <div
          className={cn(
            "flex px-3 py-1 w-full justify-between rounded-box transition-all hover:bg-accent hover:text-accent-content",
            isActive && "bg-accent text-accent-content"
          )}
        >
          <div className="flex gap-2 items-center">
            {link.icon}
            {link.label}
            {isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
          </div>
          <div className="flex gap-1">
            {number && (
              <span className="badge badge-primary px-2">
                {number.icon}
                {number.value}
              </span>
            )}
          </div>
        </div>
      )}
    </NavLink>
  );
}

function CreditProgress({
  title,
  used,
  total,
}: {
  title: string;
  used: number;
  total: number;
}) {
  const value = Math.max(0, Math.min(used, total));
  const percentage = (value / total) * 100;
  const tip = `Used ${used} of ${total}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        {title}
        <div className="tooltip" data-tip={tip}>
          {numberToKMB(used)} / {numberToKMB(total)}
        </div>
      </div>
      <progress
        className={cn(
          "progress",
          percentage > 80 && "progress-error",
          percentage > 60 && "progress-warning",
          percentage > 40 && "progress-info",
          percentage > 20 && "progress-success"
        )}
        value={value}
        max={total}
      ></progress>
    </div>
  );
}

function SetupProgress({ scrapeId }: { scrapeId: string }) {
  const fetcher = useFetcher<{
    input: SetupProgressInput;
  }>();
  const [skipped, setSkipped] = useState<string[] | undefined>(undefined);
  const { progressActions, setProgressActions } = useContext(AppContext);
  useEffect(() => {
    if (skipped === undefined || fetcher.data === undefined) {
      return;
    }
    const actions = getPendingActions(fetcher.data.input, skipped);
    setProgressActions(actions);
  }, [fetcher.data, skipped]);
  const action = progressActions[0];

  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/setup-progress",
    });
  }, [scrapeId]);

  useEffect(() => {
    setSkipped(getSkippedActions(scrapeId));
  }, []);

  useEffect(() => {
    if (skipped === undefined) {
      return;
    }
    setSkippedActions(scrapeId, skipped);
  }, [skipped]);

  function handleSkip() {
    if (skipped === undefined) {
      return;
    }
    setSkipped([...skipped, action.id]);
  }

  if (!action) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex gap-1 text-xs opacity-50">
        Next step
        <TbArrowDown />
      </div>
      <div className="flex gap-1 w-full">
        {action.canSkip && (
          <div className="tooltip" data-tip="Skip">
            <button onClick={handleSkip} className="btn btn-square">
              <TbX />
            </button>
          </div>
        )}
        <div
          className="tooltip tooltip-right w-full"
          data-tip={action.description}
        >
          <Link
            className="btn btn-primary btn-block"
            to={fetcher.data ? action.url(fetcher.data.input) : ""}
            target={action.external ? "_blank" : undefined}
            onClick={() => track("progress-next", { id: action.id })}
          >
            {action.title}
            {action.icon ?? <TbArrowRight />}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SideMenu({
  width,
  scrapeOwner,
  loggedInUser,
  contentRef,
  plan,
  scrapes,
  scrapeId,
  scrapeIdFetcher,
  toBeFixedMessages,
  openTickets,
  scrape,
  dataGapMessages,
}: {
  width?: number;
  scrapeOwner: User;
  loggedInUser: User;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  plan: Plan;
  scrapes: Scrape[];
  scrapeId?: string;
  scrapeIdFetcher: FetcherWithComponents<any>;
  toBeFixedMessages: number;
  openTickets: number;
  scrape?: Scrape;
  dataGapMessages: number;
}) {
  const links = useMemo(() => {
    const links = [
      { label: "Home", to: "/app", icon: <TbHome /> },
      {
        label: "Knowledge",
        to: "/knowledge",
        icon: <TbBook />,
        forScrape: true,
      },
      {
        label: "Actions",
        to: "/actions",
        icon: <TbPointer />,
        forScrape: true,
      },
      {
        label: "Messages",
        to: "/messages",
        icon: <TbMessage />,
        forScrape: true,
      },
      {
        label: "Data gaps",
        to: "/data-gaps",
        icon: <TbChartBarOff />,
        forScrape: true,
      },
      {
        label: "Tickets",
        to: "/tickets",
        icon: <TbTicket />,
        forScrape: true,
        ticketingEnabled: true,
      },
      {
        label: "Connect",
        to: "/connect",
        icon: <TbPlug />,
        forScrape: true,
      },
      {
        label: "Settings",
        to: "/settings",
        icon: <TbSettings />,
        forScrape: true,
      },
      {
        label: "Team",
        to: "/team",
        icon: <TbUsers />,
        forScrape: true,
      },
      { label: "Profile", to: "/profile", icon: <TbUser /> },
    ];

    return links
      .filter((link) => !link.forScrape || scrapeId)
      .filter((link) => !link.ticketingEnabled || scrape?.ticketingEnabled);
  }, []);

  const totalMessages = plan.credits.messages;
  const totalScrapes = plan.credits.scrapes;

  const availableMessages =
    scrapeOwner?.plan?.credits?.messages ?? plan.credits.messages;
  const usedMessages = totalMessages - availableMessages;

  const availableScrapes =
    scrapeOwner?.plan?.credits?.scrapes ?? plan.credits.scrapes;
  const usedScrapes = totalScrapes - availableScrapes;

  function getLinkNumber(label: string) {
    if (label === "Tickets" && openTickets > 0) {
      return {
        value: openTickets,
        icon: <TbTicket />,
        color: "blue",
      };
    }
    if (label === "Messages" && toBeFixedMessages > 0) {
      return {
        value: toBeFixedMessages,
        icon: <TbThumbDown />,
        color: "orange",
      };
    }
    if (label === "Data gaps" && dataGapMessages > 0) {
      return {
        value: dataGapMessages,
        icon: <TbChartBarOff />,
        color: "orange",
      };
    }
    return undefined;
  }

  function handleChangeScrape(scrapeId: string) {
    scrapeIdFetcher.submit(
      { intent: "set-scrape-id", scrapeId },
      {
        method: "post",
        action: "/app",
      }
    );
    (document.activeElement as HTMLElement)?.blur();
  }

  const planId = scrapeOwner?.plan?.planId;
  const visibleName = loggedInUser.name || loggedInUser.email;

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen border-r border-base-300 bg-base-200",
        "gap-0 justify-between fixed left-0 top-0",
        width && "hidden md:flex"
      )}
      style={{ width: width ?? "100%" }}
    >
      <div className="flex flex-col py-4 gap-4">
        <div className="flex flex-col px-4">
          <div className="flex justify-between">
            <LogoChakra />
            <div className="flex gap-1">
              <div
                className="tooltip tooltip-bottom h-fit"
                data-tip={
                  scrape?.widgetConfig?.private
                    ? "Private collection. Only secured channels such as Discord, Slack can be used."
                    : "Public collection. Anyone can chat with it."
                }
              >
                <span className="badge badge-neutral px-1">
                  {scrape?.widgetConfig?.private ? <TbLock /> : <TbWorld />}
                </span>
              </div>
              {["pro", "starter"].includes(planId ?? "") && (
                <div
                  className="tooltip tooltip-bottom h-fit"
                  data-tip={`Collection on ${planId} plan`}
                >
                  <span className="badge badge-primary px-1">
                    <TbCrown />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 w-full">
          <div className="dropdown w-full">
            <button
              tabIndex={0}
              role="button"
              className="btn bg-base-100 mb-1 w-full flex justify-between"
            >
              {scrapeId ? scrape?.title : "Select collection"}
              <TbChevronDown />
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-1 w-full shadow-sm"
            >
              {scrapes.map((scrape) => (
                <li key={scrape.id}>
                  <a onClick={() => handleChangeScrape(scrape.id)}>
                    {scrape.title ?? "Untitled"}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-3 w-full">
          {links.map((link, index) => (
            <SideMenuItem
              key={index}
              link={link}
              number={getLinkNumber(link.label)}
            />
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {scrapeId && <SetupProgress scrapeId={scrapeId} />}
        <div className="flex flex-col gap-2 bg-base-100 rounded-box p-2">
          <CreditProgress
            title="Messages"
            used={usedMessages}
            total={totalMessages}
          />
          <CreditProgress
            title="Scrapes"
            used={usedScrapes}
            total={totalScrapes}
          />
        </div>
        <div className="flex justify-between gap-2">
          <div className="flex gap-2 items-center">
            {loggedInUser.photo ? (
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={loggedInUser.photo} />
                </div>
              </div>
            ) : (
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-10 rounded-full">
                  <span className="text-3xl">{visibleName[0]}</span>
                </div>
              </div>
            )}

            <div className="truncate w-30">{visibleName}</div>
          </div>

          <div className="dropdown dropdown-top dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-sm btn-circle mt-1 btn-square bg-base-100"
            >
              <TbChevronUp />
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-1 p-2 shadow-sm"
            >
              <li>
                <Link
                  to="/profile#billing"
                  onClick={() => (document.activeElement as any).blur()}
                >
                  <TbCreditCard />
                  Billing
                </Link>
              </li>
              <li>
                <a href="/logout">
                  <TbLogout />
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
