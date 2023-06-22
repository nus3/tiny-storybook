import express from "express";
import type { RequestHandler } from "express";
import { readFile } from "fs-extra";
import { join } from "node:path";
import { router } from "./routes";

// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/builders/builder-vite/src/index.ts#L30-L53
const iframeMiddleware = (): RequestHandler => {
  return async (req, res, next) => {
    if (!req.url.match(/^\/iframe\.html($|\?)/)) {
      next();
      return;
    }

    const iframeHtmlPath = join(__dirname, "./input/iframe.html");
    const indexHtml = await readFile(iframeHtmlPath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(indexHtml);
  };
};

const app = express();
const port = 3000;

app.use(router);

router.use(iframeMiddleware());

// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/lib/core-server/src/dev-server.ts#L114-L120
router.get("/iframe.html", (_req, _res, next) => {
  next();
});

app.get("/", (_req, res) => {
  const storybookMainFilePath = "../.storybook/main.ts";
  const result = require(storybookMainFilePath);
  console.log(result.default);

  // TODO:
  // htmlの中では仮想モジュールが読み込まれるようにする
  // 仮想モジュールで`@storybook/react/preview`を読み込む

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
