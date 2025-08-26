import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { middleware } from "./middlewares/middlewares.js";

const app = express();
const port = process.env.PORT ?? "3000";

app.get("/", middleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
