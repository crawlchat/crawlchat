import {
  Box,
  Flex,
  Group,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { TbCheck, TbX } from "react-icons/tb";

export function MultiSelect({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const values = useMemo(() => {
    if (!value) return null;
    return value.split(",");
  }, [value]);

  function handleRemove(index: number) {
    if (!values) return;
    const newValues = values.filter((_, i) => i !== index);
    const newValue = newValues.join(",");
    onChange(newValue.length > 0 ? newValue : null);
  }

  function handleAdd() {
    const newValue = value ? `${value},${inputValue}` : inputValue;
    onChange(newValue);
    setInputValue("");
  }

  return (
    <Stack>
      <Flex gap={1}>
        {values?.map((value, index) => (
          <Group
            key={value}
            bg={"brand.outline-subtle"}
            p={2}
            pl={4}
            borderRadius={"md"}
            gap={1}
          >
            <Text fontSize={"sm"}>{value}</Text>

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
        <Input
          placeholder={placeholder ?? "Enter value"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxW="400px"
        />
        <IconButton
          variant={"subtle"}
          disabled={!inputValue}
          onClick={handleAdd}
        >
          <TbCheck />
        </IconButton>
      </Group>
    </Stack>
  );
}
