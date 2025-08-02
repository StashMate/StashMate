import { EXPO_PUBLIC_FMP_API_KEY } from '@env';

const FMP_API_BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}



export interface InvestmentDetailData {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  marketCap?: number;
  volume?: number;
  description?: string;
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

    return data.slice(0, 5).map((stock: any) => ({
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



export async function fetchStockQuote(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`${FMP_API_BASE_URL}/quote/${symbol}?apikey=${EXPO_PUBLIC_FMP_API_KEY}`);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorBody}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      console.warn(`No quote data found for ${symbol}`);
      return null;
    }
    const stock = data[0];
    return {
      symbol: stock.symbol || '',
      name: stock.name || '',
      price: stock.price || 0,
      changesPercentage: stock.changesPercentage || 0,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw error;
  }
}

export async function fetchHistoricalPrices(symbol: string, type: 'stock', period: '1day' | '1week' | '1month' | '3month' | '1year' | '5year'): Promise<{ date: string; close: number }[]> {
  try {
    let url = '';
    if (type === 'stock') {
      // FMP historical data for stocks
      url = `${FMP_API_BASE_URL}/historical-price-full/${symbol}?apikey=${EXPO_PUBLIC_FMP_API_KEY}`;
    }

    if (!url) {
      throw new Error('Invalid type for historical prices.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorBody}`);
    }
    const data = await response.json();

    if (!data || !data.historical || data.historical.length === 0) {
      console.warn(`No historical data found for ${symbol} (${type}).`);
      return [];
    }

    // Filter data based on period
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case '1day':
        startDate.setDate(today.getDate() - 1);
        break;
      case '1week':
        startDate.setDate(today.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3month':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case '5year':
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1); // Default to 1 month
    }

    return data.historical
      .filter((item: any) => new Date(item.date) >= startDate)
      .map((item: any) => ({
        date: item.date,
        close: item.close,
      }))
      .reverse(); // Newest data last for charting

  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol} (${type}):`, error);
    throw error;
  }
}

export async function fetchInvestmentDetail(symbol: string, type: 'stock'): Promise<InvestmentDetailData | null> {
  try {
    let description = '';

    if (type === 'stock') {
      const quoteResponse = await fetch(`${FMP_API_BASE_URL}/quote/${symbol}?apikey=${EXPO_PUBLIC_FMP_API_KEY}`);
      if (!quoteResponse.ok) {
        const errorBody = await quoteResponse.text();
        console.error(`HTTP error fetching stock quote: ${quoteResponse.status}, body: ${errorBody}`);
        return null;
      }
      const quoteData = await quoteResponse.json();
      if (!quoteData || quoteData.length === 0) {
        console.warn(`No quote data found for stock: ${symbol}`);
        return null;
      }
      const stockQuote = quoteData[0];

      const profileResponse = await fetch(`${FMP_API_BASE_URL}/profile/${symbol}?apikey=${EXPO_PUBLIC_FMP_API_KEY}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData && profileData.length > 0) {
          description = profileData[0].description || '';
        }
      } else {
        console.warn(`Could not fetch profile for stock ${symbol}: ${profileResponse.status}`);
      }

      return {
        symbol: stockQuote.symbol,
        name: stockQuote.name,
        price: stockQuote.price,
        changesPercentage: stockQuote.changesPercentage,
        marketCap: stockQuote.marketCap,
        volume: stockQuote.volume,
        description: description,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching investment detail for ${symbol} (${type}):`, error);
    throw error;
  }
}
