import "dotenv/config";
import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

const TELEGRAM_TOKEN = process.env.TG_TOKEN!;
const CHAT_ID = process.env.CHAT_ID!;
const API_KEY = process.env.API_KEY!;
const THRESHOLD = Number(process.env.THRESHOLD ?? 1);

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const ratesPath = path.join(process.cwd(), "rates.json");

let lastRates: Record<string, number> = {};
if (fs.existsSync(ratesPath)) {
  lastRates = JSON.parse(fs.readFileSync(ratesPath, "utf-8"));
}

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
    const isDeltaExceed = Math.abs(cur - old) >= THRESHOLD;

    if (isDeltaExceed) {
      try {
        bot.sendMessage(
          CHAT_ID,
          `Превышена дельта ${THRESHOLD} руб.: 
        ${currency}: ${old.toFixed(2)} → ${cur.toFixed(2)} руб.
        Разница: ${(cur - old).toFixed(2)} руб.
        `,
        );
      } catch (e) {
        console.error("Telegram send error:", e);
      }
    }
  }
}

(async () => {
  try {
    const newRates = await fetchRates();
    checkDelta(newRates);
    lastRates = newRates;
    fs.writeFileSync(ratesPath, JSON.stringify(lastRates, null, 2));
    console.log("Курсы обновлены", lastRates);
  } catch (err) {
    console.error("Ошибка обновления курса:", err);
  }
})();
