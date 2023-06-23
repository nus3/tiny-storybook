import type {
  BuilderOptions,
  CLIOptions,
  CoreConfig,
  LoadOptions,
  Options,
  StorybookConfig,
} from "@storybook/types";
import {
  loadAllPresets,
  loadMainConfig,
  resolveAddonName,
} from "@storybook/core-common";
import { join, resolve } from "node:path";
// import { getPreviewBuilder } from "./get-builders";
import { storybookDevServer } from "./dev-server";

const getServerChannelUrl = (port: number, { https }: { https?: boolean }) => {
  return `${https ? "wss" : "ws"}://localhost:${port}/storybook-server-channel`;
};

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

  const { renderer } = await presets.apply<CoreConfig>("core", {});

  presets = await loadAllPresets({
    corePresets: [
      require.resolve("@storybook/core-server/dist/presets/common-preset"),
      // TODO
      // @ts-ignore
      ...(renderer
        ? [resolveAddonName(options.configDir, renderer, options)]
        : []),
      // @ts-ignore
      ...corePresets,
      // @ts-ignore
      require.resolve("@storybook/core-server/dist/presets/babel-cache-preset"),
    ],
    overridePresets: [],
    ...options,
  });

  // const builderName = typeof builder === "string" ? builder : builder?.name;
  options.configDir = resolve(options.configDir);
  options.serverChannelUrl = getServerChannelUrl(options.port || 0, options);

  // if (!builderName) return;
  // const previewBuilder = getPreviewBuilder(builderName, options.configDir);

  const features = await presets.apply<StorybookConfig["features"]>("features");
  global.FEATURES = features;

  const fullOptions: Options = {
    ...options,
    presets,
    features,
  };

  await storybookDevServer(fullOptions);
};
