import type { UserConfig, ViteDevServer } from "vite";
import type { Builder, Options } from "@storybook/types";
import { createViteServer } from "./vite-server";
import { dirname, join } from "path";
import express, { RequestHandler } from "express";
import * as fs from "fs-extra";
import { transformIframeHtml } from "./transform-iframe-html";

type ViteStats = {
  toJson: () => any;
};
type ViteBuilder = Builder<UserConfig, ViteStats>;

const wrapForPnP = (input: string) =>
  dirname(require.resolve(join(input, "package.json")));

function iframeMiddleware(
  options: Options,
  server: ViteDevServer
): RequestHandler {
  return async (req, res, next) => {
    if (!req.url.match(/^\/iframe\.html($|\?)/)) {
      next();
      return;
    }

    // We need to handle `html-proxy` params for style tag HMR https://github.com/storybookjs/builder-vite/issues/266#issuecomment-1055677865
    // e.g. /iframe.html?html-proxy&index=0.css
    if (req.query["html-proxy"] !== undefined) {
      next();
      return;
    }

    const indexHtml = await fs.readFile(
      require.resolve("@storybook/builder-vite/input/iframe.html"),
      "utf-8"
    );
    const generated = await transformIframeHtml(indexHtml, options);
    const transformed = await server.transformIndexHtml(
      "/iframe.html",
      generated
    );
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(transformed);
  };
}

let server: ViteDevServer;

export async function bail(): Promise<void> {
  return server?.close();
}

export const start: ViteBuilder["start"] = async ({
  startTime,
  options,
  router,
  server: devServer,
}) => {
  server = await createViteServer(options as Options, devServer);

  const previewResolvedDir = wrapForPnP("@storybook/preview");
  const previewDirOrigin = join(previewResolvedDir, "dist");

  router.use(
    `/sb-preview`,
    express.static(previewDirOrigin, { immutable: true, maxAge: "5m" })
  );

  router.use(iframeMiddleware(options, server));
  router.use(server.middlewares);

  return {
    bail,
    stats: { toJson: () => null },
    totalTime: process.hrtime(startTime),
  };
};
