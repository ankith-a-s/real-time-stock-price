import { Component } from '@angular/core';
import { AppState, Stock } from './utils/interface';
import { StockPriceService } from './services/stock-price.service';
import { WebsocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  state: AppState = {
    chartData: [],
    dropdownStockList: [],
    masterStockList: [],
    selectedStocks: [],
  };

  constructor(
    private stockPriceService: StockPriceService,
    private webSocketService: WebsocketService
  ) {
    this.stockPriceService
      .getStockListByExchange('US')
      .subscribe((res: Stock[]) => {
        this.updateMasterStockList(res);
      });
    this.webSocketService.messages.subscribe((msg: any) => {
      if (msg.type === 'ping') return;
      this.updateStockPrices(msg);
    });
    // Add the new stock prices every 5s
    setInterval(() => this.addData(), 5000);
  }

  updateState(state: AppState) {
    this.state = { ...state };
  }

  updateMasterStockList(res) {
    this.state.dropdownStockList = res;
    this.state.masterStockList = res;
    this.updateState(this.state);
  }

  updateStockPrices(msg) {
    const newData = msg.data;
    if (newData && newData.length) {
      newData.map((stock) => {
        if (!stock.p) return;
        const stockIndex = this.state.selectedStocks.findIndex(
          (currStock) => currStock.symbol === stock.s
        );
        if(stockIndex !== -1) {
          this.state.selectedStocks[stockIndex].currentPrice.c = stock.p;
          this.updateState(this.state);
        }
      });
    }
  }

  addData() {
    if (!this.state.chartData.length) return;
    this.state.chartData.map((stock, index) => {
      const data = {
        name: new Date(),
        value: this.state.selectedStocks[index].currentPrice.c,
      };
      this.state.chartData[index].series.push(data);
    });

    this.state.chartData = [...this.state.chartData];
    this.updateState(this.state);
  }
}
