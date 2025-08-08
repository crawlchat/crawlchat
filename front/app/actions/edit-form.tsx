import {
  Box,
  Button,
  Field,
  Group,
  Heading,
  IconButton,
  Input,
  NativeSelect,
  Separator,
  Stack,
} from "@chakra-ui/react";
import { useContext } from "react";
import { EditActionContext } from "./use-edit-action";
import { TbCheck, TbPlus, TbTrash } from "react-icons/tb";
import type { ApiActionDataItem, ApiActionMethod } from "libs/prisma";

function DataItemForm({
  item,
  index,
  updateDataItem,
  removeDataItem,
}: {
  item: ApiActionDataItem;
  index: number;
  updateDataItem: (
    index: number,
    key: keyof ApiActionDataItem,
    value: string
  ) => void;
  removeDataItem: (index: number) => void;
}) {
  return (
    <Group key={index} alignItems={"end"}>
      <Field.Root w={"200px"}>
        <Field.Label>Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            defaultValue={item.type}
            onChange={(e) => updateDataItem(index, "type", e.target.value)}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Field.Root flex={1}>
        <Field.Label>Key</Field.Label>
        <Input
          placeholder="Enter your key"
          value={item.key}
          onChange={(e) => updateDataItem(index, "key", e.target.value)}
        />
      </Field.Root>

      <Field.Root flex={2}>
        <Field.Label>Description</Field.Label>
        <Input
          placeholder="Enter your description"
          value={item.description}
          onChange={(e) => updateDataItem(index, "description", e.target.value)}
        />
      </Field.Root>

      <IconButton
        colorPalette={"red"}
        variant={"subtle"}
        onClick={() => removeDataItem(index)}
      >
        <TbTrash />
      </IconButton>
    </Group>
  );
}

export function EditForm() {
  const {
    data,
    addDataItem,
    title,
    setTitle,
    url,
    setUrl,
    method,
    setMethod,
    updateDataItem,
    canSubmit,
    removeDataItem,
    headers,
    addHeaderItem,
    updateHeaderItem,
    removeHeaderItem,
  } = useContext(EditActionContext);

  return (
    <Stack gap={8}>
      <Stack>
        <Field.Root required>
          <Field.Label>Title</Field.Label>
          <Input
            placeholder="Enter your title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>URL</Field.Label>
          <Input
            placeholder="Enter your URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Method</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              defaultValue={method}
              onChange={(e) => setMethod(e.target.value as ApiActionMethod)}
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </Stack>

      <Stack>
        <Group>
          <Heading>Data</Heading>
          <IconButton
            variant={"subtle"}
            size={"xs"}
            onClick={() =>
              addDataItem({ key: "", type: "string", description: "" })
            }
          >
            <TbPlus />
          </IconButton>
        </Group>

        {data.items.map((item, index) => (
          <DataItemForm
            key={index}
            item={item}
            index={index}
            updateDataItem={updateDataItem}
            removeDataItem={removeDataItem}
          />
        ))}
      </Stack>

      <Stack>
        <Group>
          <Heading>Headers</Heading>
          <IconButton
            variant={"subtle"}
            size={"xs"}
            onClick={() =>
              addHeaderItem({ key: "", type: "string", description: "" })
            }
          >
            <TbPlus />
          </IconButton>
        </Group>

        {headers.items.map((item, index) => (
          <DataItemForm
            key={index}
            item={item}
            index={index}
            updateDataItem={updateHeaderItem}
            removeDataItem={removeHeaderItem}
          />
        ))}
      </Stack>

      <Group>
        <input
          type="hidden"
          name="data"
          value={JSON.stringify({
            title,
            url,
            method,
            data,
            headers,
          })}
        />
        <Button colorPalette={"brand"} disabled={!canSubmit} type="submit">
          Save
          <TbCheck />
        </Button>
      </Group>
    </Stack>
  );
}
