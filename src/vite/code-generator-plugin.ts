// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/builders/builder-vite/src/plugins/code-generator-plugin.ts#L20

import { Plugin } from "vite";
import { virtualFileId } from "./virtual-file-names";
import { generateModernIframeScriptCode } from "./codegen-modern-iframe-script";

export const codeGeneratorPlugin = (): Plugin => {
  return {
    name: "storybook:code-generator-plugin",
    // enforce: "pre",
    resolveId(id) {
      if (id === virtualFileId) {
        return virtualFileId;
      }

      return undefined;
    },
    load(id, _config) {
      if (id === virtualFileId) {
        return generateModernIframeScriptCode();
      }

      return undefined;
    },
  };
};
