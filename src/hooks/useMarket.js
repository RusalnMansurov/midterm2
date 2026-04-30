import { useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';

/**
 * Manages live market prices.
 * Prices are updated in real-time via WebSocket — no polling.
 *
 * @param {string|null} token - JWT
 * @returns {{ prices: Object, updatePrice: function }}
 */
const useMarket = (token) => {
  // prices: { TICKER: number }
  const [prices, setPrices] = useState({});

  const handleMessage = useCallback((data) => {
    if (data.type === 'TICKER_UPDATE') {
      const { ticker, price } = data.payload;
      setPrices((prev) => ({ ...prev, [ticker]: price }));
    }
  }, []);

  useWebSocket(handleMessage, token);

  const updatePrice = (ticker, price) => {
    setPrices((prev) => ({ ...prev, [ticker]: price }));
  };

  return { prices, updatePrice };
};

export default useMarket;
