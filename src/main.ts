import express from "express";
import { readFile } from "fs-extra";
import { join } from "node:path";
import { createServer } from "node:http";
import { router } from "./routes";
import { createViteServer } from "./vite/server";

const app = express();
const port = 3000;

const server = createServer(app);

app.use(router);

// 元の実装だとiframeMiddlewareとして定義している
// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/lib/core-server/src/dev-server.ts#L114-L120
// REF: https://github.com/storybookjs/storybook/blob/36877853d197ff4118fd6a243ea70f16b56fa3f1/code/builders/builder-vite/src/index.ts#L30-L53
router.get("/iframe.html", async (_req, res) => {
  const viteServer = await createViteServer(server);
  router.use(viteServer.middlewares);

  const iframeHtmlPath = join(__dirname, "./input/iframe.html");
  const indexHtml = await readFile(iframeHtmlPath, "utf-8");
  // const transformed = viteServer.transformIndexHtml("/iframe.html", indexHtml);

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(indexHtml);
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
