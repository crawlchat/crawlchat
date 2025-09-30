import cn from "@meltdownjs/cn";
import {
  createContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/page";
import { prisma } from "libs/prisma";
import { getSessionScrapeId } from "~/scrapes/util";
import { TbArrowRight, TbCheck } from "react-icons/tb";
import { getSession } from "~/session";
import { useLoaderData } from "react-router";

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

  return { user, scrapes, groups, messagesCount, teamMembers };
}

type StepKey =
  | "create-collection"
  | "add-knowledge"
  | "try-chat"
  | "add-members"
  | "embed"
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
    key: "try-chat",
    title: "Try chat",
    description: "Try the chatbot",
  },
  {
    key: "add-members",
    title: "Add members",
    description: "Add members to the collection",
  },
  {
    key: "embed",
    title: "Embed",
    description: "Embed the chatbot",
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
    <ul className="steps w-full">
      {steps.map((step, i) => (
        <li
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
    <div className="flex justify-center p-20">
      <div className={cn("max-w-[900px]", "w-full flex flex-col gap-2")}>
        <h3 className="text-2xl font-bold">{step.title}</h3>
        <p className="text-base-content/50">{step.description}</p>

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
      <div
        className={cn(
          "bg-base-200/50 p-4 rounded-box my-6 border border-base-300"
        )}
      >
        {children}
      </div>

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
    if (loaderData.messagesCount > 0) {
      completedSteps.push("try-chat");
    }
    if (loaderData.teamMembers > 1) {
      completedSteps.push("add-members");
    }
    return [...completedSteps, ...skippedSteps];
  }, [loaderData, skippedSteps]);

  const currentStep = useMemo<Step>(() => {
    const nonCompletedSteps = steps.filter(
      (step) => !completedSteps.includes(step.key)
    );
    return nonCompletedSteps[0];
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

export default function WelcomePage() {
  const welcome = useWelcome();

  return (
    <WelcomeContext.Provider value={welcome}>
      <div className="p-10">
        <Steps
          completedSteps={welcome.completedSteps}
          currentStep={welcome.currentStep}
        />

        <Step step={welcome.currentStep}>
          <StepContent
            action={
              <button className="btn btn-primary">
                Create
                <TbCheck />
              </button>
            }
          >
            <input
              type="text"
              className="input"
              placeholder="Ex: My Company Inc."
            />
          </StepContent>
        </Step>
      </div>
    </WelcomeContext.Provider>
  );
}
