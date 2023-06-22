import { Server } from "node:http";
import { join } from "node:path";
import { InlineConfig, createServer } from "vite";
import { codeGeneratorPlugin } from "./code-generator-plugin";

// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/builders/builder-vite/src/vite-server.ts#L8-L33
export const createViteServer = (devServer: Server) => {
  const config: InlineConfig = {
    configFile: false,
    root: join(__dirname, "../../"), // このリポジトリのrootを指定,
    base: "./",
    server: {
      middlewareMode: true,
      hmr: {
        port: 3000,
        server: devServer,
      },
      fs: {
        strict: true,
      },
    },
    appType: "custom",
    plugins: [codeGeneratorPlugin()],
  };

  return createServer(config);
};
