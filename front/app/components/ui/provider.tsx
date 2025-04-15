import {
  ChakraProvider,
  defaultConfig,
  mergeConfigs,
  createSystem,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ffffff" },
          100: { value: "#f2eaf9" },
          200: { value: "#e5d5f2" },
          300: { value: "#a36bd2" },
          400: { value: "#8841c5" },
          500: { value: "#7b2cbf" },
          600: { value: "#6f28ac" },
          700: { value: "#561f86" },
          800: { value: "#3e1660" },
          900: { value: "#250d39" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { base: "{colors.brand.500}" } },
          contrast: { value: { base: "{colors.brand.50}" } },
          fg: { value: { base: "{colors.brand.500}" } },
          muted: {
            value: {
              base: "{colors.brand.200}",
              _dark: "{colors.whiteAlpha.400}",
            },
          },
          subtle: {
            value: {
              base: "{colors.brand.100}",
              _dark: "{colors.whiteAlpha.200}",
            },
          },
          emphasized: { value: { base: "{colors.brand.300}" } },
          focusRing: { value: { base: "{colors.brand.500}" } },
          outline: {
            value: {
              base: "{colors.blackAlpha.200}",
              _dark: "{colors.whiteAlpha.200}",
            },
          },
          "outline-subtle": {
            value: {
              base: "{colors.blackAlpha.100}",
              _dark: "{colors.whiteAlpha.100}",
            },
          },
          gray: {
            value: {
              base: "{colors.blackAlpha.50}",
              _dark: "{colors.whiteAlpha.50}",
            },
          },
          "gray.100": {
            value: {
              base: "{colors.blackAlpha.100}",
              _dark: "{colors.whiteAlpha.100}",
            },
          },
          "gray.50": {
            value: {
              base: "{colors.blackAlpha.50}",
              _dark: "{colors.whiteAlpha.50}",
            },
          },
          white: {
            value: {
              base: "{colors.white}",
              _dark: "{colors.black}",
            },
          },
          "danger.subtle": {
            value: {
              base: "{colors.red.50}",
              _dark: "{colors.red.800}",
            },
          },
        },
      },
    },
  },
});

const system = createSystem(mergeConfigs(defaultConfig, config));

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
