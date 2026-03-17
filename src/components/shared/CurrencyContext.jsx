import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [displayCurrency, setDisplayCurrency] = useState('Default');
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    KRW: 1300,
    JPY: 150,
    EUR: 0.92,
  });
  const [ratesLoading, setRatesLoading] = useState(false);

  // Fetch exchange rates periodically
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setRatesLoading(true);
        // Try to fetch from a reliable free API
        const response = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        if (response.ok) {
          const data = await response.json();
          setExchangeRates({
            USD: 1,
            KRW: data.rates.KRW || 1300,
            JPY: data.rates.JPY || 150,
            EUR: data.rates.EUR || 0.92,
          });
        }
      } catch (error) {
        console.warn('Exchange rate fetch failed, using defaults:', error);
        // Keep defaults if fetch fails
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('displayCurrency');
    if (saved) {
      setDisplayCurrency(saved);
    }
  }, []);

  // Save currency preference
  const updateDisplayCurrency = (currency) => {
    setDisplayCurrency(currency);
    localStorage.setItem('displayCurrency', currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        updateDisplayCurrency,
        exchangeRates,
        ratesLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};