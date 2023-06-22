import express from "express";

import type { CoreConfig, Options } from "@storybook/types";
import { createServer } from "http";
import { router } from "./routes";
import { getManagerBuilder, getPreviewBuilder } from "./get-builders";
import { getServerChannel } from "./get-server-channel";
import { useStatics } from "./server-statics";
import { bail, start } from "./previewBuilder";

export const storybookDevServer = async (options: Options) => {
  const app = express();
  const server = createServer(app);
  const core = await options.presets.apply<CoreConfig>("core");

  app.use(router);

  const serverChannel = getServerChannel(server);

  const builderName =
    typeof core?.builder === "string" ? core.builder : core?.builder?.name;
  if (!builderName) return;

  const [_previewBuilder, _managerBuilder] = await Promise.all([
    getPreviewBuilder(builderName, options.configDir),
    getManagerBuilder(),
    useStatics(router, options),
  ]);

  const listening = new Promise<void>((resolve, reject) => {
    // @ts-expect-error (Following line doesn't match TypeScript signature at all 🤔)
    server.listen(options.port, (error: Error) =>
      error ? reject(error) : resolve()
    );
  });

  // const previewStarted = previewBuilder
  //   .start({
  //     startTime: process.hrtime(),
  //     options,
  //     router,
  //     server,
  //     channel: serverChannel,
  //   })
  //   .catch(async (e: any) => {
  //     await previewBuilder?.bail().catch();
  //     throw e;
  //   });

  const previewStarted = start({
    startTime: process.hrtime(),
    options,
    router,
    server,
    channel: serverChannel,
  }).catch(async (e: any) => {
    await bail().catch();
    throw e;
  });

  router.get("/iframe.html", (_req, _res, next) => {
    previewStarted.catch(() => {}).then(() => next());
  });

  await listening;

  await previewStarted;
};
