/* eslint-disable no-param-reassign */

import * as fs from "fs";
import type { Plugin } from "vite";
import type { Options } from "@storybook/types";

import {
  // virtualAddonSetupFile,
  virtualFileId,
  // virtualPreviewFile,
  virtualStoriesFile,
} from "./virtual-file-names";
import { generateImportFnScriptCode } from "./codegen-importfn-script";
import { generateModernIframeScriptCode } from "./codegen-modern-iframe-script";

export function codeGeneratorPlugin(options: Options): Plugin {
  const iframePath = require.resolve(
    "@storybook/builder-vite/input/iframe.html"
  );
  let iframeId: string;
  let projectRoot: string;

  return {
    name: "storybook:code-generator-plugin",
    enforce: "pre",
    configureServer(server) {
      server.watcher.on("change", () => {
        const appModule = server.moduleGraph.getModuleById(virtualFileId);
        if (appModule) {
          server.moduleGraph.invalidateModule(appModule);
        }
        const storiesModule =
          server.moduleGraph.getModuleById(virtualStoriesFile);
        if (storiesModule) {
          server.moduleGraph.invalidateModule(storiesModule);
        }
      });

      server.watcher.on("add", (path) => {
        if (/\.stories\.([tj])sx?$/.test(path) || /\.mdx$/.test(path)) {
          server.watcher.emit("change", virtualStoriesFile);
        }
      });
    },
    // config(config, { command }) {
    //   if (command === "build") {
    //     if (!config.build) {
    //       config.build = {};
    //     }
    //     config.build.rollupOptions = {
    //       ...config.build.rollupOptions,
    //       input: iframePath,
    //     };
    //   }
    // },
    configResolved(config) {
      projectRoot = config.root;
      iframeId = `${config.root}/iframe.html`;
    },
    resolveId(source) {
      if (source === virtualFileId) {
        return virtualFileId;
      }
      if (source === iframePath) {
        return iframeId;
      }
      if (source === virtualStoriesFile) {
        return virtualStoriesFile;
      }
      // if (source === virtualPreviewFile) {
      //   return virtualPreviewFile;
      // }
      // if (source === virtualAddonSetupFile) {
      //   return virtualAddonSetupFile;
      // }

      return undefined;
    },
    async load(id, _config) {
      // const storyStoreV7 = options.features?.storyStoreV7;
      if (id === virtualStoriesFile) {
        // if (storyStoreV7) {
        //   return generateImportFnScriptCode(options);
        // }
        // return generateVirtualStoryEntryCode(options);

        return generateImportFnScriptCode(options);
      }

      // if (id === virtualAddonSetupFile) {
      //   return generateAddonSetupCode();
      // }

      // if (id === virtualPreviewFile && !storyStoreV7) {
      //   return generatePreviewEntryCode(options);
      // }

      if (id === virtualFileId) {
        // if (storyStoreV7) {
        //   return generateModernIframeScriptCode(options, projectRoot);
        // }
        // return generateIframeScriptCode(options, projectRoot);

        return generateModernIframeScriptCode(options, projectRoot);
      }

      if (id === iframeId) {
        return fs.readFileSync(
          require.resolve("@storybook/builder-vite/input/iframe.html"),
          "utf-8"
        );
      }

      return undefined;
    },
    // async transformIndexHtml(html, ctx) {
    //   if (ctx.path !== "/iframe.html") {
    //     return undefined;
    //   }
    //   return transformIframeHtml(html, options);
    // },
  };
}
