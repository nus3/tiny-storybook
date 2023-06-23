import type { Builder } from "@storybook/types";

export async function getManagerBuilder(): Promise<Builder<unknown>> {
  return import("@storybook/builder-manager");
}

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

  // const previewBuilder = await import(pathToFileURL(builderPackage).href);
  // `pathToFileURL(builderPackage).href`では`Error: Cannot find module`になるので、builderPackage(@storybook/builder-viteのパス)を直接importしている
  const previewBuilder = await import(builderPackage);
  return previewBuilder;
}
