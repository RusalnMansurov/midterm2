import { useState } from 'react';
import api from '../api/client';

export default function BuyModal({ stock, currentPrice, user, onClose, onSuccess }) {
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = (currentPrice * shares).toFixed(2);
  const canAfford = user?.walletBalance >= currentPrice * shares;

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/trades/buy', { ticker: stock.ticker, shares });
      onSuccess(data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }} onClick={onClose}>
      <div className="card" style={{ width: 340, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>Buy ${stock.ticker}</h3>
        <p className="muted" style={{ marginBottom: 16 }}>{stock.ownerUsername} · ${currentPrice.toFixed(2)} / share</p>

        <label className="muted">Number of shares</label>
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ margin: '6px 0 12px' }}
        />

        <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="muted">Total cost</span>
            <span>${total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="muted">Balance after</span>
            <span style={{ color: canAfford ? 'var(--green)' : 'var(--red)' }}>
              ${canAfford ? (user.walletBalance - currentPrice * shares).toFixed(2) : 'Insufficient'}
            </span>
          </div>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={handleBuy}
            disabled={loading || !canAfford}
          >
            {loading ? 'Buying…' : 'Confirm Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}
