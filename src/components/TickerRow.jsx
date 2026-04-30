export default function TickerRow({ stock, currentPrice, prevPrice, onBuy }) {
  const change = prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2) : null;
  const isUp = change > 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      gap: 12,
    }}>
      <div style={{ minWidth: 52 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>${stock.ticker}</div>
        <div className="muted">{stock.ownerUsername}</div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ textAlign: 'right', minWidth: 70 }}>
        <div style={{ fontWeight: 500 }}>${currentPrice.toFixed(2)}</div>
        {change !== null && (
          <div style={{ fontSize: 11, color: isUp ? 'var(--green)' : 'var(--red)' }}>
            {isUp ? '▲' : '▼'} {Math.abs(change)}%
          </div>
        )}
      </div>

      <button className="btn-primary btn-sm" onClick={() => onBuy(stock)}>
        Buy
      </button>
    </div>
  );
}
