import type { Server } from "http";
import { createServer } from "vite";
import type { Options } from "@storybook/types";
import { commonConfig } from "./vite-config";
import { sanitizeEnvVars } from "./envs";

export async function createViteServer(options: Options, devServer: Server) {
  const { presets } = options;

  const commonCfg = await commonConfig(options);

  const config = {
    ...commonCfg,
    // Set up dev server
    server: {
      middlewareMode: true,
      hmr: {
        port: options.port,
        server: devServer,
      },
      fs: {
        strict: true,
      },
    },
    appType: "custom" as const,
  };

  const finalConfig = await presets.apply("viteFinal", config, options);

  return createServer(await sanitizeEnvVars(options, finalConfig));
}
