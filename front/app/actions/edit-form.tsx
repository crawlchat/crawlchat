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
import { TbCheck, TbPlus, TbTrash, TbX } from "react-icons/tb";
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
    <Stack key={index}>
      <Group alignItems={"end"}>
        <Field.Root>
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
        <IconButton
          colorPalette={"red"}
          variant={"subtle"}
          onClick={() => removeDataItem(index)}
        >
          <TbTrash />
        </IconButton>
      </Group>

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
    </Stack>
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
    removeDataItem,
    headers,
    addHeaderItem,
    updateHeaderItem,
    removeHeaderItem,
  } = useContext(EditActionContext);

  return (
    <Stack>
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

      <Stack mt={6}>
        <Group>
          <Heading size={"lg"}>Data</Heading>
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

        <Stack gap={8}>
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
      </Stack>

      <Stack mt={6}>
        <Group>
          <Heading size={"lg"}>Headers</Heading>
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
    </Stack>
  );
}
