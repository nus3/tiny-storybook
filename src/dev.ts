import { sync as readUpSync } from "read-pkg-up";
import { cache } from "@storybook/core-common";
import { join } from "node:path";
import { buildDevStandalone } from "./buildDevStandalone";

const dev = async () => {
  process.env.NODE_ENV = "development";

  const packageJson = readUpSync({
    cwd: join(__dirname, "../node_modules/@storybook/cli"),
  })?.packageJson;

  const cliOptions = {
    disableTelemetry: false,
    debug: false,
    open: true,
    versionUpdates: true,
    releaseNotes: true,
    port: 3000,
  };

  const options = {
    ...cliOptions,
    configDir: "./.storybook",
    configType: "DEVELOPMENT",
    ignorePreview: false,
    cache,
    packageJson,
  } as any;

  await buildDevStandalone(options);
};

dev();
