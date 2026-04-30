import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, prices, onLogout }) {
  const loc = useLocation();

  // Net Worth is NEVER stored in DB — calculated here from live prices
  const netWorth = user
    ? Object.entries(user.holdings || {}).reduce((sum, [ticker, shares]) => {
        const price = prices[ticker] ?? 0;
        return sum + shares * price;
      }, user.walletBalance || 0)
    : 0;

  const nav = (path) => ({
    style: {
      color: loc.pathname === path ? 'var(--blue)' : 'var(--text2)',
      fontWeight: loc.pathname === path ? 500 : 400,
    },
  });

  return (
    <header style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 16 }}>PEX</span>

      <Link to="/"          {...nav('/')}>Market</Link>
      <Link to="/portfolio" {...nav('/portfolio')}>Portfolio</Link>
      <Link to="/my-ticker" {...nav('/my-ticker')}>My Ticker</Link>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            <span style={{ color: 'var(--text2)', fontSize: 12 }}>
              Cash: <b style={{ color: 'var(--text)' }}>${user.walletBalance?.toFixed(2)}</b>
            </span>
            <span style={{ color: 'var(--text2)', fontSize: 12 }}>
              Net Worth: <b style={{ color: 'var(--green)' }}>${netWorth.toFixed(2)}</b>
            </span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{user.username}</span>
          </>
        )}
        <button className="btn-sm" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
