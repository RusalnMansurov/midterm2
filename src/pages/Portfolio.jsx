import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Portfolio({ prices, user }) {
  const [history, setHistory] = useState([]);
  const [dbPrices, setDbPrices] = useState({});

  useEffect(() => {
    api.get('/trades/history').then((r) => setHistory(r.data));
    // Загружаем актуальные цены из БД при старте
    api.get('/stocks').then((r) => {
      const p = {};
      r.data.forEach((s) => (p[s.ticker] = s.price));
      setDbPrices(p);
    });
  }, []);

  const holdings = user?.holdings || {};

  // Берём цену из WS если есть, иначе из БД
  const getPrice = (ticker) => prices[ticker] ?? dbPrices[ticker] ?? 0;

  const stocksValue = Object.entries(holdings).reduce((sum, [ticker, shares]) => {
    return sum + shares * getPrice(ticker);
  }, 0);

  const netWorth = (user?.walletBalance || 0) + stocksValue;

  const handleSell = async (ticker, shares) => {
    try {
      const { data } = await api.post('/trades/sell', { ticker, shares: 1 });
      // Обновляем данные без перезагрузки страницы
      user.walletBalance = data.walletBalance;
      user.holdings = data.holdings;
      window.location.reload();
    } catch (e) {
      alert(e.response?.data?.error || 'Sell failed');
    }
  };

  return (
    <main style={{ maxWidth: 700, margin: '30px auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 16 }}>My Portfolio</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card">
          <div className="muted" style={{ marginBottom: 4 }}>Cash balance</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>${user?.walletBalance?.toFixed(2) ?? '—'}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ marginBottom: 4 }}>Holdings value</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--blue)' }}>${stocksValue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ marginBottom: 4 }}>
            Net Worth <span style={{ fontSize: 10, background: 'var(--bg3)', padding: '1px 5px', borderRadius: 6 }}>live</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--green)' }}>${netWorth.toFixed(2)}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: 10 }}>Positions</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        {Object.keys(holdings).length === 0 && (
          <p style={{ padding: 16, color: 'var(--text2)' }}>No holdings yet. Buy some stocks!</p>
        )}
        {Object.entries(holdings).map(([ticker, shares]) => {
          const price = getPrice(ticker);
          const value = price * shares;
          return (
            <div key={ticker} style={{
              display: 'flex', alignItems: 'center', padding: '10px 16px',
              borderBottom: '1px solid var(--border)', gap: 12,
            }}>
              <div style={{ minWidth: 60 }}>
                <div style={{ fontWeight: 600 }}>${ticker}</div>
                <div className="muted">{shares} shares</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 500 }}>${value.toFixed(2)}</div>
                <div className="muted">${price.toFixed(2)} / share</div>
              </div>
              <button className="btn-danger btn-sm" onClick={() => handleSell(ticker, 1)}>Sell 1</button>
            </div>
          );
        })}
      </div>

      <h3 style={{ marginBottom: 10 }}>History</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {history.length === 0 && (
          <p style={{ padding: 16, color: 'var(--text2)' }}>No transactions yet.</p>
        )}
        {history.map((tx) => (
          <div key={tx._id} style={{
            display: 'flex', alignItems: 'center', padding: '8px 16px',
            borderBottom: '1px solid var(--border)', gap: 12, fontSize: 13,
          }}>
            <span style={{ color: tx.type === 'buy' ? 'var(--green)' : 'var(--red)', fontWeight: 500, minWidth: 32 }}>
              {tx.type.toUpperCase()}
            </span>
            <span>${tx.ticker}</span>
            <span className="muted">{tx.shares} × ${tx.pricePerShare.toFixed(2)}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontWeight: 500 }}>${tx.total.toFixed(2)}</span>
            <span className="muted" style={{ fontSize: 11 }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}