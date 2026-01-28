# 💱 Currency Checker

![Currency Checker](../screenshots/currency-widget.PNG)

Приложение для отслеживания курсов валют (USD, EUR, GBP → RUB) с:

- backend-сервером на **Node.js + Express + TypeScript**
- периодическим обновлением курсов через **ExchangeRate API**
- уведомлениями в **Telegram**, если курс изменился больше заданного порога
- frontend-виджетом на **React + Vite + TypeScript**

---

## ✨ Возможности

- 📈 Получение актуальных курсов валют
- 🔔 Уведомления в Telegram при изменении курса
- 💾 Кэширование последних курсов в `rates.json`
- 🌐 API endpoint `/rates` для фронтенда
- 🖥️ UI-виджет для отображения курсов
- ⚙️ Настройка через `.env`

---

## Телеграм уведомления
Бот отправляет сообщение, если изменение курса превышает THRESHOLD
Проверка курсов выполняется по таймеру (setInterval)
Уведомления приходят только когда backend запущен
Пример сообщения:
```
Превышена дельта 1 руб.:
USD: 75.58 → 77.10 руб.
Разница: +1.52 руб.
```

## Запуск проекта локально
```
git clone https://github.com/your-username/currency-checker.git
cd currency-checker
cd backend // http://localhost:3001
npm install
npm run start
cd ..
сd frontend // http://localhost:5173
npm install
npm run dev
```

## Настройка окружения
Создай файл .env в папке backend и укажи переменные:
```
TG_TOKEN=your_telegram_bot_token
CHAT_ID=your_chat_id
API_KEY=your_exchangerate_api_key
THRESHOLD=1
```