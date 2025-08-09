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
  Text,
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
    <Stack
      border={"1px solid"}
      borderColor={"brand.outline"}
      p={4}
      rounded={"lg"}
    >
      <Group alignItems={"end"}>
        <Field.Root>
          <Field.Label>Type</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              defaultValue={item.type}
              onChange={(e) => updateDataItem(index, "type", e.target.value)}
            >
              <option value="dynamic">Dynamic</option>
              <option value="value">Value</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Data Type</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              defaultValue={item.type}
              onChange={(e) =>
                updateDataItem(index, "dataType", e.target.value)
              }
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

      {item.type === "dynamic" && (
        <Field.Root flex={2}>
          <Field.Label>Description</Field.Label>
          <Input
            placeholder="Enter your description"
            value={item.description}
            onChange={(e) =>
              updateDataItem(index, "description", e.target.value)
            }
          />
        </Field.Root>
      )}
      {item.type === "value" && (
        <Field.Root flex={2}>
          <Field.Label>Value</Field.Label>
          <Input
            placeholder="Enter the value"
            value={item.value ?? ""}
            onChange={(e) => updateDataItem(index, "value", e.target.value)}
          />
        </Field.Root>
      )}
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
    description,
    setDescription,
  } = useContext(EditActionContext);

  return (
    <Stack>
      <Text opacity={0.5}>
        Add the external APIs to be used by the chatbot whenever it is required.
        Give URL and describe about the API below so that the AI knows about it
        and uses it appropriately.
      </Text>

      <Stack mt={6}>
        <Field.Root required>
          <Field.Label>Title</Field.Label>
          <Input
            placeholder="Enter the title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Description</Field.Label>
          <Input
            placeholder="Enter the description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>URL</Field.Label>
          <Input
            placeholder="Enter the URL"
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
              addDataItem({
                key: "",
                dataType: "string",
                description: "",
                type: "dynamic",
                value: null,
              })
            }
          >
            <TbPlus />
          </IconButton>
        </Group>

        <Text opacity={0.5}>
          Data to be passed to the API. It will be passed as JSON for POST and
          as query parameters for GET requests. Select Value if you want to pass
          the value as constant.
        </Text>

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

      <Stack mt={6}>
        <Group>
          <Heading size={"lg"}>Headers</Heading>
          <IconButton
            variant={"subtle"}
            size={"xs"}
            onClick={() =>
              addHeaderItem({
                key: "",
                dataType: "string",
                description: "",
                type: "dynamic",
                value: null,
              })
            }
          >
            <TbPlus />
          </IconButton>
        </Group>

        <Text opacity={0.5}>
          Headers to be passed to the API. Use Value type if it is constant or
          an API key.
        </Text>

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
