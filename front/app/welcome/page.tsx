import cn from "@meltdownjs/cn";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/page";
import { prisma } from "libs/prisma";
import { TbArrowRight, TbCheck } from "react-icons/tb";
import { getSession } from "~/session";
import { useFetcher, useLoaderData } from "react-router";
import { NewKnowledgeGroupForm } from "~/knowledge/new-group";
import { Logo } from "~/components/logo";
import Confetti from "react-confetti-boom";
import { track } from "~/components/track";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  const scrapes = await prisma.scrape.findMany({
    where: {
      userId: user!.id,
    },
  });
  const groups = await prisma.knowledgeGroup.findMany({
    where: {
      userId: user!.id,
    },
  });
  const messagesCount = await prisma.message.count({
    where: {
      scrapeId: {
        in: scrapes.map((s) => s.id),
      },
    },
  });
  const teamMembers = scrapeId
    ? await prisma.scrapeUser.count({
        where: {
          scrapeId,
        },
      })
    : 0;

  const firstGroupItems =
    groups.length > 0
      ? await prisma.scrapeItem.count({
          where: {
            knowledgeGroupId: groups[0].id,
          },
        })
      : [];

  return { user, scrapes, groups, messagesCount, teamMembers, firstGroupItems };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "hide-onboarding") {
    await prisma.user.update({
      where: { id: user!.id },
      data: { showOnboarding: false },
    });

    return { success: true };
  }
}

type StepKey =
  | "create-collection"
  | "add-knowledge"
  | "refresh-knowledge"
  | "try-chat"
  | "dashboard";

type Step = {
  key: StepKey;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    key: "create-collection",
    title: "Create collection",
    description:
      "Collection is a group of knowledge bases, integrations, and connectors. Create one for your company.",
  },
  {
    key: "add-knowledge",
    title: "Add knowledge",
    description: "Add knowledge to the collection",
  },
  {
    key: "refresh-knowledge",
    title: "Sync knowledge",
    description: "Refresh the knowledge",
  },
  {
    key: "try-chat",
    title: "Ask AI",
    description: "Try the chatbot",
  },
  {
    key: "dashboard",
    title: "Congrats!",
    description: "Explore the dashboard",
  },
];

function Steps({
  completedSteps,
  currentStep,
}: {
  completedSteps: StepKey[];
  currentStep: Step;
}) {
  return (
    <ul className="steps steps-vertical lg:steps-horizontal w-full">
      {steps.map((step, i) => (
        <li
          key={step.key}
          className={cn(
            "step",
            completedSteps.includes(step.key) && "step-primary",
            currentStep.key === step.key && "step-primary"
          )}
        >
          {i === steps.length - 1 && <span className="step-icon">🎉</span>}
          {step.title}
        </li>
      ))}
    </ul>
  );
}

function Step({ step, children }: PropsWithChildren<{ step: Step }>) {
  return (
    <div className="flex justify-center mt-10">
      <div className={cn("max-w-[1200px]", "w-full flex flex-col gap-2")}>
        {children}
      </div>
    </div>
  );
}

function StepContent({
  children,
  skipStep,
  action,
}: PropsWithChildren<{ skipStep?: () => void; action: React.ReactNode }>) {
  return (
    <>
      <div className={cn("my-6 flex flex-col gap-2")}>{children}</div>

      <div className="flex justify-end gap-2">
        {skipStep && (
          <button className="btn" onClick={() => skipStep()}>
            Do this later
            <TbArrowRight />
          </button>
        )}

        {action}
      </div>
    </>
  );
}

function useWelcome() {
  const loaderData = useLoaderData<typeof loader>();

  const [skippedSteps, setSkippedSteps] = useState<StepKey[]>([]);

  const completedSteps = useMemo<StepKey[]>(() => {
    const completedSteps: StepKey[] = [];
    if (loaderData.scrapes.length > 0) {
      completedSteps.push("create-collection");
    }
    if (loaderData.groups.length > 0) {
      completedSteps.push("add-knowledge");
    }
    if (
      loaderData.groups.length > 0 &&
      loaderData.groups[0].status === "done"
    ) {
      completedSteps.push("refresh-knowledge");
    }
    if (loaderData.messagesCount > 0) {
      completedSteps.push("try-chat");
    }
    return [...completedSteps, ...skippedSteps];
  }, [loaderData, skippedSteps]);

  const currentStep = useMemo<Step>(() => {
    const pendingSteps = steps.filter(
      (step) => !completedSteps.includes(step.key)
    );
    return pendingSteps[0];
  }, [completedSteps]);

  const skipStep = (step: Step) => {
    setSkippedSteps((prev) => [...prev, step.key]);
  };

  return {
    completedSteps,
    currentStep,
    skipStep,
  };
}

const WelcomeContext = createContext<ReturnType<typeof useWelcome>>(
  {} as ReturnType<typeof useWelcome>
);

function CreateCollectionStep() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/app">
      <StepContent action={<></>}>
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 md:h-[300px]",
            "w-full"
          )}
        >
          <p className="text-base-content/50 text-center max-w-md">
            Collection contains your knowledge base, integrations, and
            connectors. Create one for your company.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-2 w-full">
            <input type="hidden" name="intent" value="create-collection" />
            <input type="hidden" name="redirectUrl" value={"/welcome"} />
            <input
              type="text"
              className="input md:w-sm w-full"
              placeholder="Ex: My Company Inc."
              name="name"
              required
              disabled={fetcher.state !== "idle"}
            />
            <button
              className="btn btn-primary"
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Create
              <TbCheck />
            </button>
          </div>
        </div>
      </StepContent>
    </fetcher.Form>
  );
}

function AddKnowledgeGroupStep() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/knowledge/group">
      <StepContent
        action={
          <button
            className="btn btn-primary"
            disabled={fetcher.state !== "idle"}
            type="submit"
          >
            {fetcher.state !== "idle" && (
              <span className="loading loading-spinner loading-xs" />
            )}
            Create
            <TbCheck />
          </button>
        }
      >
        <input type="hidden" name="redirectUrl" value={"/welcome"} />
        <input type="hidden" name="shouldRefresh" value="on" />
        <NewKnowledgeGroupForm
          disabled={fetcher.state !== "idle"}
          skip={["confluence", "linear", "github_issues", "notion"]}
        />
      </StepContent>
    </fetcher.Form>
  );
}

function FetchKnowledgeGroupStep() {
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center md:h-[300px] gap-4">
      <span className="loading loading-spinner loading-lg" />
      <p className="text-base-content/50">
        Fetching {loaderData.groups[0].title} ({loaderData.firstGroupItems})
      </p>
    </div>
  );
}

function TryChatStep() {
  const loaderData = useLoaderData<typeof loader>();
  const { skipStep, currentStep } = useContext(WelcomeContext);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-base-content/50 text-center">
        All set! Try the chatbot below. You can customise it later.
      </p>
      <div className="border border-base-300 rounded-box overflow-hidden w-full md:w-auto">
        <iframe
          src={`/w/${loaderData.scrapes[0].id}`}
          className="h-[400px] md:w-[480px] w-full"
        />
      </div>
      <div>
        <button className="btn" onClick={() => skipStep(currentStep)}>
          Next
          <TbArrowRight />
        </button>
      </div>
    </div>
  );
}

function DashboardStep() {
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.submit(
      {
        intent: "hide-onboarding",
      },
      {
        method: "post",
      }
    );
  }, []);

  const links = [
    {
      label: "Embed the chatbot",
      href: "/connect/embed",
      newTab: true,
    },
    {
      label: "Add the Discord bot",
      href: "/connect/discord",
      newTab: true,
    },
    {
      label: "Add the Slack bot",
      href: "/connect/slack",
      newTab: true,
    },
    {
      label: "Set up the system prompt",
      href: "/settings#prompt",
      newTab: true,
    },
    {
      label: "Add team members",
      href: "/team",
      newTab: true,
    },
    {
      label: "Upgrade to a paid plan",
      href: "/profile#billing",
      newTab: true,
    },
    {
      label: "Go to dashboard",
      href: "/app",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-base-content/50 max-w-sm text-center">
        All set! You have configured the basics. Here are few more items you can
        configure.
      </p>
      <ul className="bg-base-100 rounded-box border border-base-300 w-xs">
        {links.map((link, index) => (
          <li
            key={index}
            className={cn(
              "p-3 px-4 border-b border-base-300 last:border-b-0",
              "flex justify-center"
            )}
          >
            <a
              href={link.href}
              className="link link-primary link-hover"
              target={link.newTab ? "_blank" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <Confetti
        particleCount={100}
        colors={[
          "#1E1E2E",
          "#2A2D43",
          "#3B82F6",
          "#06B6D4",
          "#14B8A6",
          "#22C55E",
          "#84CC16",
          "#EAB308",
          "#F59E0B",
          "#F97316",
          "#EF4444",
          "#DC2626",
          "#DB2777",
          "#EC4899",
          "#A855F7",
          "#8B5CF6",
          "#6366F1",
          "#475569",
          "#94A3B8",
          "#F1F5F9",
        ]}
      />
    </div>
  );
}

export default function WelcomePage() {
  const welcome = useWelcome();

  useEffect(() => {
    track("welcome", {});
  }, []);

  return (
    <WelcomeContext.Provider value={welcome}>
      <div className="md:p-10 p-4 flex justify-center w-full">
        <div className="w-full max-w-[900px]">
          <div className="flex justify-center mb-2 mt-6 md:mt-0">
            <Logo />
          </div>

          <p className="text-base-content/50 text-center mb-10">
            Welcome! Let's get you set up. Or go to{" "}
            <a
              href="/app?skip-onboarding=true"
              className="link link-primary link-hover"
            >
              dashboard
            </a>
          </p>

          <Steps
            completedSteps={welcome.completedSteps}
            currentStep={welcome.currentStep}
          />

          <Step step={welcome.currentStep}>
            {welcome.currentStep.key === "create-collection" && (
              <CreateCollectionStep />
            )}
            {welcome.currentStep.key === "add-knowledge" && (
              <AddKnowledgeGroupStep />
            )}
            {welcome.currentStep.key === "refresh-knowledge" && (
              <FetchKnowledgeGroupStep />
            )}
            {welcome.currentStep.key === "try-chat" && <TryChatStep />}
            {welcome.currentStep.key === "dashboard" && <DashboardStep />}
          </Step>
        </div>
      </div>
    </WelcomeContext.Provider>
  );
}
