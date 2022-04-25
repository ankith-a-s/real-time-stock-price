import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { StockPriceService } from '../../services/stock-price.service';
import { WebsocketService } from '../../services/websocket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState, Stock } from '../../utils/interface';
import { openSnackBar } from '../../utils/function';


@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.scss']
})
export class AddStockComponent {
  //search autocomplete
  searchCtrl = new FormControl();
  filteredStocks: Observable<Stock[]>;

  @Input() state;

  @Output() updateState = new EventEmitter<AppState>();

  constructor(
    private stockPriceService: StockPriceService,
    private _snackBar: MatSnackBar,
    private webSocketService: WebsocketService
  ) { 
  }

  ngOnInit(): void {
    this.filteredStocks = this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      map((state) => this._filterStocks(state)),
      distinctUntilChanged()
    );
  }


  addStockToList() {
    const symbol = this.searchCtrl.value ? this.searchCtrl.value.toLowerCase() : '';
    let stock = this.getStockDetails(symbol);
    if (!symbol || !stock || this.state.selectedStocks.length >= 25) {
      if(this.state.selectedStocks.length >= 25) {
        openSnackBar(this._snackBar, 'Max number of stocks allowed to be added is 25');
      }
      return;
    }
    this.getPriceAndAddToState(stock);
    this.updateStockDropdownList(symbol);
    this.subscribeToStock();
    this.clearSearch();
  }

  getStockDetails(symbol) {
    return this.state.dropdownStockList.filter((state: Stock) => {
      return state.displaySymbol.toLowerCase() === symbol;
    })[0];
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.searchCtrl.markAsPristine();
  }

  subscribeToStock() {
    this.webSocketService.messages.next({ type: 'subscribe', symbol: this.searchCtrl.value});
  }

  updateStockDropdownList(symbol) {
    this.state.dropdownStockList = this.state.dropdownStockList.filter((stock) => stock.symbol.toLowerCase() !== symbol);
  }

  getPriceAndAddToState(stock) {
    this.stockPriceService
      .getPriceQuoteForSymbol(this.searchCtrl.value)
      .subscribe((res: any) => {
        this.state.selectedStocks.push({ id: this.state.selectedStocks.length + 1, currentPrice: res, ...stock});
        this.state.chartData.push({ name: stock.description, series: [{ name: new Date(), value: res.c }]});
        this.updateState.emit(this.state);
      });
  }

  private _filterStocks(value: string): Stock[] {
    if (!value) return [];
    const filterValue = value.toLowerCase();
    return this.state.dropdownStockList
      .filter((stock: Stock) => {
        return (
          stock.displaySymbol.toLowerCase().includes(filterValue) ||
          stock.description.toLowerCase().includes(filterValue)
        );
      })
      .slice(0, 10);
  }
}
