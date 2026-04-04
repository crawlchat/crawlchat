import cn from "@meltdownjs/cn";
import { Fragment, useMemo, type ReactElement } from "react";
import { TbCheck, TbX } from "react-icons/tb";

export type CompareFeatureValue = {
  value: boolean | number | string;
  lable?: string;
  bestOrder?: "low" | "high";
};

export type CompareFeatures<Name extends string> = Record<
  Name,
  CompareFeatureValue
>;

export type CompareEntity<Name extends string> = {
  name: string;
  url: string;
  features: CompareFeatures<Name>;
};

export type Comparison<Name extends string> = CompareEntity<Name>[];
export type CompareFeatureName =
  | string
  | {
      icon?: ReactElement;
      label: string;
      note?: string;
      type?: string;
    };
export type CompareFeatureNames<Name extends string> = Record<
  Name,
  CompareFeatureName
>;

function FeatureValueComponent({ value }: { value: CompareFeatureValue }) {
  function main() {
    if (typeof value.value === "boolean") {
      return value.value ? (
        <div className="text-primary">
          <TbCheck />
          <span className="hidden">Yes</span>
        </div>
      ) : (
        <div className="text-base-content/20">
          <TbX className="text-base-content/20" />
          <span className="hidden">No</span>
        </div>
      );
    }
    return value.value;
  }

  function label() {
    return value.lable;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <span>{main()}</span>
      <span className="text-xs text-base-content/50">{label()}</span>
    </div>
  );
}

function FeatureName({ name }: { name: CompareFeatureName }) {
  if (typeof name === "object") {
    return (
      <div>
        <div className="flex items-center gap-2">
          {name.icon}
          <span>{name.label}</span>
        </div>
        {name.note && (
          <div className="text-xs text-base-content/40">{name.note}</div>
        )}
      </div>
    );
  }

  return name;
}

export const CompareTable = <Name extends string>({
  comparison,
  names,
  size,
  defaultType,
}: {
  comparison: Comparison<Name>;
  names: CompareFeatureNames<Name>;
  size?: "xl" | "lg";
  defaultType?: string;
}) => {
  const types = useMemo(() => {
    return new Set(
      (Object.values(names) as CompareFeatureName[])
        .map((n) => {
          if (typeof n === "object") {
            return n.type;
          }
        })
        .filter(Boolean) as string[]
    );
  }, [names]);

  return (
    <div className="overflow-x-auto border border-base-300 rounded-box">
      <table
        className={cn(
          "table table-pin-rows",
          size === "xl" && "table-xl",
          size === "lg" && "table-lg"
        )}
      >
        <thead>
          <tr>
            <th className="w-1/3"></th>
            {comparison.map((entity, index) => (
              <td
                key={index}
                className={cn(
                  "w-1/3 text-center",
                  size === "xl" && "text-xl",
                  size === "lg" && "text-lg"
                )}
                style={{
                  width: `${100 / (comparison.length + 1)}%`,
                }}
              >
                {entity.name}
              </td>
            ))}
          </tr>
        </thead>

        {[...types, undefined].map((type, index) => (
          <Fragment key={index}>
            {(type || defaultType) && (
              <thead>
                <tr>
                  <th
                    colSpan={comparison.length + 1}
                    className={cn(
                      "py-2 bg-base-200/50 text-xs uppercase",
                      index > 0 && "border-t-2 border-base-300/50"
                    )}
                  >
                    {type ?? "Others"}
                  </th>
                </tr>
              </thead>
            )}
            <tbody>
              {Object.keys(names)
                .filter((name) => (names as any)[name].type === type)
                .map((key) => (
                  <tr key={key}>
                    <td className="text-base-content/80">
                      <FeatureName name={names[key as Name]} />
                    </td>
                    {comparison.map((entity, index) => (
                      <td key={index} className="text-center">
                        <FeatureValueComponent
                          value={entity.features[key as Name]}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </Fragment>
        ))}
      </table>
    </div>
  );
};
