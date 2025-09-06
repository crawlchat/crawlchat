import cn from "@meltdownjs/cn";
import { TbCheck } from "react-icons/tb";

export type RadioCardOption = {
  label: string;
  value: string;
  description?: string;
  summary?: string;
  disabled?: boolean;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  img?: string;
};

export function RadioCard({
  options,
  name,
  value,
  onChange,
  cols,
}: {
  options: RadioCardOption[];
  name?: string;
  value: string;
  onChange: (value: string) => void;
  cols?: number;
}) {
  cols = cols ?? options.length;
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        cols === 1 && "md:grid-cols-1",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-3",
        cols === 4 && "md:grid-cols-4",
        cols === 5 && "md:grid-cols-5",
        cols === 6 && "md:grid-cols-6",
        cols === 7 && "md:grid-cols-7",
        cols === 8 && "md:grid-cols-8",
        cols === 9 && "md:grid-cols-9",
        cols === 10 && "md:grid-cols-10"
      )}
    >
      <input type="hidden" name={name} value={value} />
      {options.map((option) => (
        <div
          key={option.value}
          className={cn(
            "flex gap-2 flex-1 border border-base-300 p-4 bg-base-100",
            "rounded-box justify-between cursor-pointer",
            value === option.value && "border-primary outline outline-primary",
            option.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (option.disabled) {
              return;
            }
            onChange(option.value);
          }}
        >
          <div className="flex flex-col gap-1">
            {option.icon && <div className="text-2xl">{option.icon}</div>}
            {option.img && (
              <img
                src={option.img}
                alt={option.label}
                className="w-14 h-14 rounded-box shadow"
              />
            )}
            <span className="font-medium">{option.label}</span>
            {option.summary && (
              <span className="text-xs text-base-content/50">
                {option.summary}
              </span>
            )}
            {option.description && (
              <span className="text-sm text-base-content/50">
                {option.description}
              </span>
            )}
            {option.content}
          </div>
          <div>
            <TbCheck
              className={cn(
                "text-2xl",
                value !== option.value && "text-base-content/20",
                value === option.value && "text-primary"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
