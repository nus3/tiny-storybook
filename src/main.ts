import express from "express";

const app = express();
const port = 3000;

app.get("/", (_req, res) => {
  const storybookMainFilePath = "../.storybook/main.ts";
  const result = require(storybookMainFilePath);
  console.log(result.default);

  // TODO: /iframe.htmlにリクエストが来たらhtmlを返す
  // htmlの中では仮想モジュールが読み込まれるようにする
  // 仮想モジュールで`@storybook/react/preview`を読み込む

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
