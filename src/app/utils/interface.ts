import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

export interface StockPrice {
  id: string;
  name: string;
  price: number;
}

export interface StockQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface Stock {
  description: string;
  displaySymbol: string;
  symbol: string;
  s: string;
  type: string;
  id: string;
  currentPrice: StockQuote;
}

export interface AppState {
  chartData: any[];
  dropdownStockList: Stock[];
  masterStockList: Stock[];
  selectedStocks: Stock[];
}
