import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule } from '@angular/common/http';
import { StockListComponent } from './stock-list/stock-list.component';
import { LineChartModule } from '@swimlane/ngx-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AddStockComponent } from './add-stock/add-stock.component';
import { ChartViewComponent } from './chart-view/chart-view.component';

@NgModule({
  declarations: [AppComponent, StockListComponent, ConfirmDialogComponent, AddStockComponent, ChartViewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxChartsModule,
    LineChartModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent],
})
export class AppModule {}
