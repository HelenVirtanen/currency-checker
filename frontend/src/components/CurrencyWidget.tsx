import { useEffect, useState } from 'react';

export function CurrencyWidget() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const res = await fetch('http://localhost:3001/rates');
      const data = await res.json();
      setRates(data);
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!rates) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Курсы RUB</h3>
      <ul>
        <li>USD: {rates.USD.toFixed(2)}</li>
        <li>EUR: {rates.EUR.toFixed(2)}</li>
        <li>GBP: {rates.GBP.toFixed(2)}</li>
      </ul>
    </div>
  );
}
