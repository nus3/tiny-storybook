import express from "express";
import { router } from "./routes";

const app = express();
const port = 3000;

app.use(router);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
