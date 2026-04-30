import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import MyTicker from './pages/MyTicker';
import Login from './pages/Login';
import Register from './pages/Register';
import useMarket from './hooks/useMarket';
import api from './api/client';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('pex_token'));
  const [user, setUser] = useState(null);
  const { prices, updatePrice } = useMarket(token);

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => { localStorage.removeItem('pex_token'); setToken(null); });
  }, [token]);

  const login = (t, u) => {
    localStorage.setItem('pex_token', t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('pex_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register onLogin={login} />} />
          <Route path="*"         element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar user={user} prices={prices} onLogout={logout} />
      <Routes>
        <Route path="/"          element={<Market prices={prices} user={user} updateUser={updateUser} />} />
        <Route path="/portfolio" element={<Portfolio prices={prices} user={user} />} />
        <Route path="/my-ticker" element={<MyTicker user={user} updateUser={updateUser} updatePrice={updatePrice} />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
