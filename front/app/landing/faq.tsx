import cn from "@meltdownjs/cn";
import type { ReactNode } from "react";
import { useState } from "react";
import { TbArrowRight, TbChevronDown, TbChevronUp } from "react-icons/tb";
import { track } from "~/components/track";

export type FaqItem = {
  question: string;
  answer: ReactNode;
};

type FaqProps = {
  items: FaqItem[];
  footer?: ReactNode | null;
  className?: string;
};

function DefaultAskFooter() {
  function handleAsk() {
    track("faq-ask", {});
    (
      window as { crawlchatEmbed?: { show: () => void } }
    ).crawlchatEmbed?.show();
  }

  return (
    <div className="flex justify-center mt-16">
      <button onClick={handleAsk} className="btn btn-primary btn-soft btn-lg">
        Question not listed? Ask here
        <TbArrowRight />
      </button>
    </div>
  );
}

export function Faq({ items, footer, className }: FaqProps) {
  const [active, setActive] = useState<number>();

  function handleClick(index: number) {
    track("faq-click", {
      question: items[index].question,
    });
    if (active === index) {
      setActive(undefined);
    } else {
      setActive(index);
    }
  }

  const footerNode = footer === undefined ? <DefaultAskFooter /> : footer;

  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, index) => (
        <div key={index} className="border-b border-base-300 last:border-b-0">
          <div
            className={cn(
              "flex justify-between gap-4 text-2xl cursor-pointer py-8",
              "hover:text-primary items-center",
              active === index && "text-primary"
            )}
            onClick={() => handleClick(index)}
          >
            <h3>{item.question}</h3>
            <span className="shrink-0">
              {active === index ? <TbChevronUp /> : <TbChevronDown />}
            </span>
          </div>
          <div
            className={cn("text-xl hidden pb-8", active === index && "block")}
          >
            {item.answer}
          </div>
        </div>
      ))}

      {footerNode}
    </div>
  );
}
