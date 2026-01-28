import { useEffect, useState } from "react";
import "./CurrencyWidget.css";

export function CurrencyWidget() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("http://localhost:3001/rates");
        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }
        const data = await res.json();
        setRates(data);
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!rates) return <div>Загрузка...</div>;

  return (
    <div className="currency-widget">
      <h2 className="currency-heading">Курсы RUB</h2>
      <ul className="currency-list">
        <li className="currency-item">
          <span className="currency-name">USD:</span>
          <span>{rates.USD.toFixed(2)}</span>
        </li>
        <li className="currency-item">
          <span className="currency-name">EUR:</span>
          <span>{rates.EUR.toFixed(2)}</span>
        </li>
        <li className="currency-item">
          <span className="currency-name">GBP:</span>
          <span>{rates.GBP.toFixed(2)}</span>
        </li>
      </ul>
    </div>
  );
}
