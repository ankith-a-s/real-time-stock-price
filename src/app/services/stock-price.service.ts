import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockPriceService {

  constructor(
    private http: HttpClient
  ) { }

  queryStocks(query) {
    return this.http.get(`${environment.FINNHUB_API_URL}search`, {
      params: {
        token: environment.FINNHUB_TOKEN,
        q: query
      }
    })
  }

  getPriceQuoteForSymbol(symbol) {
    return this.http.get(`${environment.FINNHUB_API_URL}quote`, {
      params: {
        token: environment.FINNHUB_TOKEN,
        symbol
      }
    })
  }

  getStockListByExchange(exchange) {
    return this.http.get(`${environment.FINNHUB_API_URL}stock/symbol`, {
      params: {
        token: environment.FINNHUB_TOKEN,
        exchange
      }
    })
  }
}
