import type { ApiActionDataType } from "@packages/common/prisma";
import { useContext, useEffect, useState } from "react";
import { TbPlayerPlay, TbSend, TbX } from "react-icons/tb";
import { useFetcher } from "react-router";
import { DataList } from "~/components/data-list";
import { EditActionContext } from "./use-edit-action";

function StringInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      className="input w-full"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      className="input w-full"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
    />
  );
}

function BooleanInput({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="input w-full"
      value={String(value)}
      onChange={(e) => onChange(e.target.value === "true")}
      disabled={disabled}
    >
      <option value={""}>Select</option>
      <option value={"true"}>true</option>
      <option value={"false"}>false</option>
    </select>
  );
}

function Input({
  type,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  type: ApiActionDataType;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  if (type === "string") {
    return (
      <StringInput
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  if (type === "number") {
    return (
      <NumberInput
        value={value as number}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  if (type === "boolean") {
    return (
      <BooleanInput
        value={value as boolean}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
}

export function ApiActionTestModal() {
  const { data, headers, method, url } = useContext(EditActionContext);
  const [dataValues, setDataValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const [headerValues, setHeaderValues] = useState<
    Record<string, string | number | boolean>
  >({});
  const fetcher = useFetcher();

  useEffect(() => {
    reset();
  }, []);

  function onDataValueChange(key: string, value: string | number | boolean) {
    setDataValues((data) => {
      data[key] = value;
      return { ...data };
    });
  }

  function onHeaderValueChange(key: string, value: string | number | boolean) {
    setHeaderValues((data) => {
      data[key] = value;
      return { ...data };
    });
  }

  function reset() {
    fetcher.reset();

    const newHeaders: Record<string, string | number | boolean> = {};
    for (const item of headers.items) {
      newHeaders[item.key] = item.value ?? "";
    }
    setHeaderValues(newHeaders);

    const newData: Record<string, string | number | boolean> = {};
    for (const item of data.items) {
      newData[item.key] = item.value ?? "";
    }
    setDataValues(newData);
  }

  return (
    <dialog id="api-action-test-modal" className="modal z-90">
      <div className="modal-box max-w-xl flex flex-col gap-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TbPlayerPlay />
          Test Action
        </h3>

        <div className="flex gap-2">
          <span className="badge badge-primary badge-soft">
            {method.toUpperCase()}
          </span>
          <div className="badge badge-soft min-w-0 truncate">{url}</div>
        </div>

        <div>
          {data.items.map((item) => (
            <fieldset className="fieldset">
              <legend className="fieldset-legend gap-1">
                {item.key}
                <span className="opacity-50">(Body)</span>
              </legend>
              <Input
                placeholder={item.description}
                value={dataValues[item.key] ?? ""}
                onChange={(v) => onDataValueChange(item.key, v)}
                type={item.dataType}
                disabled={item.type === "value"}
              />
            </fieldset>
          ))}
        </div>

        <div>
          {headers.items.map((item) => (
            <fieldset className="fieldset">
              <legend className="fieldset-legend gap-1">
                {item.key}
                <span className="opacity-50">(Header)</span>
              </legend>
              <Input
                placeholder={item.description}
                value={headerValues[item.key] ?? ""}
                onChange={(v) => onHeaderValueChange(item.key, v)}
                type={item.dataType}
                disabled={item.type === "value"}
              />
            </fieldset>
          ))}
        </div>

        {fetcher.data && (
          <div className="border border-base-300 rounded-box p-2">
            <DataList
              data={[
                {
                  label: "Status",
                  value: fetcher.data.status ?? "-",
                },
                {
                  label: "Text",
                  value: (
                    <div className="text-xs">{fetcher.data.text ?? "-"}</div>
                  ),
                },
                {
                  label: "Error",
                  value: fetcher.data.error ?? "-",
                },
              ]}
            />
          </div>
        )}

        <div>
          <fetcher.Form method="post" className="flex justify-end gap-2">
            <input type="hidden" name="intent" value="test" />
            <input
              type="hidden"
              name="payload"
              value={JSON.stringify({
                data: dataValues,
                headers: headerValues,
                url,
                method,
              })}
            />
            <button
              type="button"
              className="btn"
              disabled={fetcher.state !== "idle"}
              onClick={reset}
            >
              Clear
              <TbX />
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" && (
                <span className="loading loading-spinner" />
              )}
              Send
              <TbSend />
            </button>
          </fetcher.Form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
