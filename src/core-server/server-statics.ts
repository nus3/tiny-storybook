import type { Options, StorybookConfig } from "@storybook/types";
import { getDirectoryFromWorkingDir } from "@storybook/core-common";
import express from "express";
import path from "path";

export async function useStatics(router: any, options: Options) {
  const staticDirs = await options.presets.apply<StorybookConfig["staticDirs"]>(
    "staticDirs"
  );

  if (!staticDirs) return;

  const statics = [
    ...staticDirs.map((dir) =>
      typeof dir === "string" ? dir : `${dir.from}:${dir.to}`
    ),
    ...(options.staticDir || []),
  ];

  if (statics && statics.length > 0) {
    await Promise.all(
      statics.map(async (dir) => {
        const relativeDir = staticDirs
          ? getDirectoryFromWorkingDir({
              configDir: options.configDir,
              workingDir: process.cwd(),
              directory: dir,
            })
          : dir;
        const { staticPath, targetEndpoint } = await parseStaticDir(
          relativeDir
        );

        router.use(
          targetEndpoint,
          express.static(staticPath, { index: false })
        );
      })
    );
  }
}

export const parseStaticDir = async (arg: string) => {
  // Split on last index of ':', for Windows compatibility (e.g. 'C:\some\dir:\foo')
  const lastColonIndex = arg.lastIndexOf(":");
  const isWindowsAbsolute = path.win32.isAbsolute(arg);
  const isWindowsRawDirOnly = isWindowsAbsolute && lastColonIndex === 1; // e.g. 'C:\some\dir'
  const splitIndex =
    lastColonIndex !== -1 && !isWindowsRawDirOnly ? lastColonIndex : arg.length;

  const targetRaw = arg.substring(splitIndex + 1) || "/";
  const target = targetRaw.split(path.sep).join(path.posix.sep); // Ensure target has forward-slash path

  const rawDir = arg.substring(0, splitIndex);
  const staticDir = path.isAbsolute(rawDir) ? rawDir : `./${rawDir}`;
  const staticPath = path.resolve(staticDir);
  const targetDir = target.replace(/^\/?/, "./");
  const targetEndpoint = targetDir.substring(1);

  return { staticDir, staticPath, targetDir, targetEndpoint };
};
