import "dotenv/config";
import * as express from "express";
import fetch from "node-fetch";
import * as TelegramBot from "node-telegram-bot-api";
import * as fs from "fs";
import * as cors from "cors";

const TELEGRAM_TOKEN = process.env.TG_TOKEN!;
const CHAT_ID = process.env.CHAT_ID!;
const API_KEY = process.env.API_KEY!;
const THRESHOLD = Number(process.env.THRESHOLD ?? 1);

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

let lastRates: Record<string, number> = {};
if (fs.existsSync("rates.json")) {
  lastRates = JSON.parse(fs.readFileSync("rates.json", "utf-8"));
}

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send(
    "Currency Checker API работает! Используйте /rates для текущих курсов.",
  );
});

app.get("/rates", (req, res) => {
  res.json(lastRates);
});

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`,
    );
    if (!res.ok) {
      throw new Error(`Ошибка HTTP-запроса: ${res.status}`);
    }

    const data = (await res.json()) as any;

    if (
      data.result !== "success" ||
      !data.conversion_rates ||
      !data.conversion_rates.RUB
    ) {
      throw new Error("Некорректный ответ от API");
    }

    const usdToRub = data.conversion_rates.RUB;

    return {
      USD: usdToRub,
      EUR: usdToRub / data.conversion_rates.EUR,
      GBP: usdToRub / data.conversion_rates.GBP,
    };
  } catch (error) {
    console.error("Ошибка fetchRates:", error);
    throw error;
  }
}

function checkDelta(newRates: Record<string, number>) {
  for (const currency of ["USD", "EUR", "GBP"]) {
    const cur = newRates[currency];
    if (!cur) continue;

    const old = lastRates[currency] ?? cur;

    if (Math.abs(cur - old) >= THRESHOLD) {
      bot.sendMessage(
        CHAT_ID,
        `Превышена дельта ${THRESHOLD} руб.: 
        ${currency}: ${old.toFixed(2)} → ${cur.toFixed(2)} руб.
        Разница: ${cur - old} руб.
        `,
      );
    }
  }
}

async function updateRates() {
  try {
    const newRates = await fetchRates();
    checkDelta(newRates);
    lastRates = newRates;
    fs.writeFileSync("rates.json", JSON.stringify(lastRates, null, 2));
    console.log("Курсы обновлены", lastRates);
  } catch (err) {
    console.error("Ошибка обновления курса:", err);
  }
}

app.listen(3001, () => console.log("Backend запущен на http://localhost:3001"));
setInterval(updateRates, 60 * 60 * 1000);
updateRates();
