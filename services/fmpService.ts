import { EXPO_PUBLIC_FMP_API_KEY } from '@env';

const FMP_API_BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

export async function fetchStocks(): Promise<StockData[]> {
  try {
    const response = await fetch(`${FMP_API_BASE_URL}/stock_market/gainers?apikey=${EXPO_PUBLIC_FMP_API_KEY}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorBody}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('FMP API for stocks did not return an array:', data);
      return [];
    }

    return data.map((stock: any) => ({
      symbol: stock.symbol || stock.ticker || '',
      name: stock.name || stock.companyName || '',
      price: stock.price || 0,
      changesPercentage: stock.changesPercentage || stock.changes || 0,
    }));
  } catch (error) {
    console.error('Error fetching stocks from FMP:', error);
    throw error;
  }
}

export async function fetchCrypto(): Promise<CryptoData[]> {
  try {
    const response = await fetch(`${FMP_API_BASE_URL}/cryptocurrencies?apikey=${EXPO_PUBLIC_FMP_API_KEY}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorBody}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('FMP API for crypto did not return an array:', data);
      return [];
    }

    return data.map((crypto: any) => ({
      symbol: crypto.symbol || '',
      name: crypto.name || '',
      price: crypto.price || 0,
      changesPercentage: crypto.changesPercentage || 0,
    }));
  } catch (error) {
    console.error('Error fetching crypto from FMP:', error);
    throw error;
  }
}