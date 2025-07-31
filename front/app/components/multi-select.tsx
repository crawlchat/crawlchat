import {
  Box,
  Flex,
  Group,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { TbCheck, TbX } from "react-icons/tb";

export type SelectValue = {
  title: string;
  value: string;
};

export function MultiSelect({
  placeholder,
  value,
  onChange,
  selectValues,
}: {
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  selectValues?: Array<SelectValue>;
}) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleAdd() {
    let newValue = inputValue;

    if (selectedValue) {
      newValue = selectedValue;
    }
    onChange([...value, newValue]);
    setInputValue("");
    setSelectedValue(null);
  }

  function getTitle(value: string) {
    return selectValues?.find((v) => v.value === value)?.title ?? value;
  }

  return (
    <Stack>
      <Flex gap={1}>
        {value.map((value, index) => (
          <Group
            key={index}
            bg={"brand.outline-subtle"}
            p={2}
            pl={4}
            borderRadius={"md"}
            gap={1}
          >
            <Text fontSize={"sm"}>{getTitle(value)}</Text>
            <Box
              onClick={() => handleRemove(index)}
              p={1}
              cursor={"pointer"}
              opacity={0.5}
              _hover={{
                opacity: 1,
              }}
            >
              <TbX />
            </Box>
          </Group>
        ))}
      </Flex>
      <Group>
        {selectValues ? (
          <NativeSelect.Root width="400px">
            <NativeSelect.Field
              value={selectedValue ?? undefined}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <option value="" disabled selected>
                {placeholder ?? "Select"}
              </option>
              {selectValues?.map((value) => (
                <option key={value.value} value={value.value}>
                  {value.title}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        ) : (
          <Input
            placeholder={placeholder ?? "Enter value"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxW="400px"
          />
        )}
        <IconButton
          variant={"subtle"}
          disabled={!inputValue && !selectedValue}
          onClick={handleAdd}
        >
          <TbCheck />
        </IconButton>
      </Group>
    </Stack>
  );
}
