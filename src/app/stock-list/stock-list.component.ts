import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { StockPriceService } from '../stock-price.service';
import { WebsocketService } from '../websocket.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface StockPrice {
  id: string;
  name: string;
  price: number;
}

export interface Stock {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
})
export class StockListComponent {
  chartData: any[];

  // chart options
  view: any[] = [1200, 600];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Stock Price ($)';
  updateInterval;

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  autoScale = true;

  //table
  displayedColumns: string[] = ['id', 'description', 'symbol', 'price', 'delete'];
  dataSource: MatTableDataSource<StockPrice>;

  //search autocomplete
  searchCtrl = new FormControl();
  filteredStocks: Observable<Stock[]>;

  stockList: Stock[] = [];
  masterStockList: Stock[] = [];
  users = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private stockPriceService: StockPriceService,
    private webSocketService: WebsocketService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.users);

    this.filteredStocks = this.searchCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      map((state) => this._filterStates(state)),
      distinctUntilChanged()
    );

    this.stockPriceService
      .getStockListByExchange('US')
      .subscribe((res: Stock[]) => {
        this.stockList = res;
        this.masterStockList = res;
      });
    this.webSocketService.messages.subscribe((msg: any) => {
      if (msg.type === 'ping') return;
      const newData = msg.data;
      if (newData && newData.length) {
        newData.map((stock) => {
          if (!stock.p) return;
          const stockIndex = this.users.findIndex(
            (currStock) => currStock.s === stock.symbol
          );
          this.users[stockIndex].currentPrice.c = stock.p;
        });
      }
    });

    this.chartData = [];

    this.updateInterval = setInterval(() => this.addData(), 5000);
  }

  openSnackBar(message) {
    this._snackBar.open(message, 'X', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 2000
    });
  }

  ngOnInit() {}

  private _filterStates(value: string): Stock[] {
    if (!value) return [];
    const filterValue = value.toLowerCase();
    return this.stockList
      .filter((state: Stock) => {
        return (
          state.displaySymbol.toLowerCase().includes(filterValue) ||
          state.description.toLowerCase().includes(filterValue)
        );
      })
      .slice(0, 10);
  }

  sendMsg(message) {
    this.webSocketService.messages.next(message);
  }

  confirmDialog(): Observable<boolean> {
    const message = `Do you want to delete this stock?`;

    const dialogData = new ConfirmDialogModel("Confirm Delete", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData
    });

    return dialogRef.afterClosed();
  }

  removeItemsFromList(item, index) {
    this.confirmDialog().subscribe(state => {
      if(!state) return;
      this.stockList.push(this.masterStockList.filter(stock => stock.symbol === item.symbol)[0])
      this.users.splice(index, 1);
      this.dataSource.data = this.users;
      this.chartData.splice(index, 1);
      this.sendMsg({
        type: 'unsubscribe',
        symbol: item.symbol,
      });
    })

  }

  addStockToList() {
    const symbol = this.searchCtrl.value.toLowerCase();
    let stock = this.stockList.filter((state: Stock) => {
      return state.displaySymbol.toLowerCase() === symbol;
    })[0];
    if (!symbol || !stock || this.users.length >= 25) {
      if(this.users.length >= 25) {
        this.openSnackBar('Max number of stocks allowed to be added is 25');
      }
      return;
    }
    this.stockPriceService
      .getPriceQuoteForSymbol(this.searchCtrl.value)
      .subscribe((res: any) => {
        this.users.push({
          id: this.users.length + 1,
          currentPrice: res,
          ...stock,
        });
        this.dataSource.data = this.users;
        this.chartData.push({
          name: stock.description,
          series: [
            {
              name: new Date(),
              value: res.c,
            },
          ],
        });
      });
    this.stockList = this.stockList.filter(
      (stock) => stock.symbol.toLowerCase() !== symbol
    );
    this.sendMsg({
      type: 'subscribe',
      symbol: this.searchCtrl.value,
    });
    this.searchCtrl.setValue('');
    this.searchCtrl.markAsPristine();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addData() {
    if (!this.chartData.length) return;

    this.chartData.map((stock, index) => {
      const data = {
        name: new Date(),
        value: this.users[index].currentPrice.c,
      };
      this.chartData[index].series.push(data);
    });

    this.chartData = [...this.chartData];
  }
}
