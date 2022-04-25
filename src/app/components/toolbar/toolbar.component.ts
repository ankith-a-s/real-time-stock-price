import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { openSnackBar } from '../../utils/function';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private _snackbarInstance: MatSnackBar) { }

  ngOnInit(): void {
  }

  copyURLToClipboard() {
    const cb = navigator.clipboard;
    cb.writeText(window.location.href).then(() => openSnackBar(this._snackbarInstance, 'Link copied successfully'));
  }
}
