import { useState } from 'react';
import api from '../api/client';

export default function MyTicker({ user, updateUser, updatePrice }) {
  const [ticker, setTicker] = useState('');
  const [initPrice, setInitPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [createError, setCreateError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [priceSuccess, setPriceSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setLoading(true);
    try {
      const { data } = await api.post('/stocks', {
        ticker: ticker.toUpperCase(),
        price: parseFloat(initPrice),
      });
      updateUser({ ownTicker: data.ticker });
      updatePrice(data.ticker, data.price);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create ticker');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();
    setPriceError('');
    setPriceSuccess(false);
    setLoading(true);
    try {
      await api.put(`/stocks/${user.ownTicker}/price`, { price: parseFloat(newPrice) });
      updatePrice(user.ownTicker, parseFloat(newPrice));
      setPriceSuccess(true);
      setNewPrice('');
      setTimeout(() => setPriceSuccess(false), 3000);
    } catch (err) {
      setPriceError(err.response?.data?.error || 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.ownTicker) {
    return (
      <main style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
        <h2 style={{ marginBottom: 8 }}>Create your ticker</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
          You can issue your own stock once. Other users can buy your shares.
        </p>
        <div className="card">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 5 }}>Ticker symbol (2–5 letters)</label>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5))}
                placeholder="e.g. DEV"
                required
              />
            </div>
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 5 }}>Initial price ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={initPrice}
                onChange={(e) => setInitPrice(e.target.value)}
                placeholder="e.g. 100.00"
                required
              />
            </div>
            {createError && <p className="error-msg">{createError}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Issue Ticker'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 4 }}>My Ticker: ${user.ownTicker}</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
        Only you can change the price. Every update broadcasts to all connected users instantly.
      </p>

      <div className="card">
        <form onSubmit={handlePriceUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="muted" style={{ display: 'block', marginBottom: 5 }}>New price ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Enter new price"
              required
            />
          </div>

          {priceError && <p className="error-msg">{priceError}</p>}
          {priceSuccess && (
            <p style={{ color: 'var(--green)', fontSize: 13 }}>
              Price updated — broadcast sent to all clients via WebSocket
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading || !newPrice}>
            {loading ? 'Updating…' : 'Update Price → Broadcast'}
          </button>
        </form>

        <div style={{
          marginTop: 16,
          background: 'var(--bg3)',
          borderRadius: 8,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#7cf7b0',
        }}>
          {`{ "type": "TICKER_UPDATE", "payload": { "ticker": "${user.ownTicker}", "price": ... } }`}
        </div>
      </div>
    </main>
  );
}
