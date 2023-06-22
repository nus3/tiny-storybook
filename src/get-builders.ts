import type { Builder } from "@storybook/types";
import { pathToFileURL } from "node:url";

export async function getPreviewBuilder(
  builderName: string,
  configDir: string
): Promise<Builder<unknown>> {
  let builderPackage: string;
  if (builderName) {
    builderPackage = require.resolve(
      ["webpack5"].includes(builderName)
        ? `@storybook/builder-${builderName}`
        : builderName,
      { paths: [configDir] }
    );
  } else {
    throw new Error("no builder configured!");
  }
  const previewBuilder = await import(pathToFileURL(builderPackage).href);
  return previewBuilder;
}
