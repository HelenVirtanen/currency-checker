import { useQuery } from "@tanstack/react-query";
import "./CurrencyWidget.css";

export function CurrencyWidget() {
  const fetchRates = async () => {
      try {
        const res = await fetch("http://localhost:3001/rates");
        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }
        return res.json();
      } catch (error) {
        console.error("Ошибка загрузки курсов:", error);
      }
    };

  const {
    data: rates,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rates"],
    queryFn: fetchRates,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка: {(error as Error).message}</div>;

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
