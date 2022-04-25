import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
import { StockPriceService } from '../../services/stock-price.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState, Stock, StockPrice } from '../../utils/interface';



@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
})
export class StockListComponent {

  //table
  displayedColumns: string[] = ['id', 'description', 'symbol', 'price', 'delete'];
  dataSource: MatTableDataSource<Stock>;

  @Input() state: AppState;

  @Output() updateState = new EventEmitter<AppState>();
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private stockPriceService: StockPriceService,
    private webSocketService: WebsocketService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.state.selectedStocks);
  }

  ngOnChanges() {
    if(!this.dataSource || !this.dataSource.data) return;
    this.dataSource.data = this.state.selectedStocks;
  }

  openSnackBar(message) {
    this._snackBar.open(message, 'X', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 2000
    });
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
      this.state.dropdownStockList.push(this.state.masterStockList.filter(stock => stock.symbol === item.symbol)[0])
      this.state.selectedStocks.splice(index, 1);
      this.dataSource.data = this.state.selectedStocks;
      this.state.chartData.splice(index, 1);
      this.sendMsg({
        type: 'unsubscribe',
        symbol: item.symbol,
      });
      this.updateState.emit(this.state);
    })

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

  
}
