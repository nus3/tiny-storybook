import type {
  BuilderOptions,
  CLIOptions,
  CoreConfig,
  LoadOptions,
} from "@storybook/types";
import { loadAllPresets, loadMainConfig } from "@storybook/core-common";
import { join, resolve } from "node:path";
import { getPreviewBuilder } from "./get-builders";

export const buildDevStandalone = async (
  options: CLIOptions & LoadOptions & BuilderOptions
) => {
  const config = await loadMainConfig(options);

  const { framework } = config;
  const corePresets = [];

  const frameworkName =
    typeof framework === "string" ? framework : framework?.name;

  if (frameworkName) {
    corePresets.push(join(frameworkName, "preset"));
  }

  let presets = await loadAllPresets({
    corePresets,
    overridePresets: [],
    ...options,
  });

  const { builder } = await presets.apply<CoreConfig>("core", {});

  const builderName = typeof builder === "string" ? builder : builder?.name;
  options.configDir = resolve(options.configDir);

  if (!builderName) return;
  const previewBuilder = getPreviewBuilder(builderName, options.configDir);
  console.log({ previewBuilder });
};
