import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import Bree from "bree";
import path from "path";

const app = express();
app.use(cors());

const ratesPath = path.join(process.cwd(), "rates.json");

app.get("/", (_, res) => {
  res.send(
    "Currency Checker API работает! Используйте /rates для текущих курсов.",
  );
});

app.get("/rates", (_, res) => {
  if (!fs.existsSync(ratesPath)) {
    return res.json({});
  }

  const data = fs.readFileSync(ratesPath, "utf-8");
  res.json(JSON.parse(data));
});

app.listen(3001, () => console.log("Backend запущен на http://localhost:3001"));

const bree = new Bree({
  root: path.join(__dirname, "jobs"),
  jobs: [
    {
      name: "updateRates",
      interval: "1h"
    }
  ]
});

bree.start();
bree.run("updateRates");