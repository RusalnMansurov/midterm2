import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import TickerRow from '../components/TickerRow';
import BuyModal from '../components/BuyModal';

export default function Market({ prices, user, updateUser }) {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const savedPrices = useRef({});

  useEffect(() => {
    // Загружаем сохранённые цены из localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('pex_base_prices') || '{}');
      savedPrices.current = stored;
    } catch {}

    api.get('/stocks').then((r) => {
      setStocks(r.data);
      // Берём сохранённые цены, для новых тикеров берём текущую цену из БД
      const stored = savedPrices.current;
      const updated = { ...stored };
      r.data.forEach((s) => {
        if (!updated[s.ticker]) {
          updated[s.ticker] = s.price;
        }
      });
      savedPrices.current = updated;
      localStorage.setItem('pex_base_prices', JSON.stringify(updated));
    });
  }, []);

  const handleBuySuccess = (data) => {
    updateUser({ walletBalance: data.walletBalance, holdings: data.holdings });
  };

  return (
    <main style={{ maxWidth: 700, margin: '30px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Live Market</h2>
        <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Real-time via WebSocket
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {stocks.length === 0 && (
          <p style={{ padding: 20, color: 'var(--text2)' }}>No tickers yet. Be the first to create one!</p>
        )}
        {stocks.map((stock) => {
          const currentPrice = prices[stock.ticker] ?? stock.price;
          const basePrice = savedPrices.current[stock.ticker] ?? currentPrice;
          return (
            <TickerRow
              key={stock.ticker}
              stock={stock}
              currentPrice={currentPrice}
              prevPrice={basePrice}
              onBuy={setSelected}
            />
          );
        })}
      </div>

      {selected && (
        <BuyModal
          stock={selected}
          currentPrice={prices[selected.ticker] ?? selected.price}
          user={user}
          onClose={() => setSelected(null)}
          onSuccess={handleBuySuccess}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </main>
  );
}