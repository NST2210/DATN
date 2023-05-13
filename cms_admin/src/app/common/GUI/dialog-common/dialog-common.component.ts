import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-common',
  templateUrl: './dialog-common.component.html',
  styleUrls: ['./dialog-common.component.scss']
})
export class DialogCommonComponent implements OnInit {
  title!: String;
  message!: String;
  showConfirm: boolean = true;

  constructor(
      private dialogRef: MatDialogRef<DialogCommonComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
      this.title = this.data.title;
      this.message = this.data.message;
      if (this.data["showConfirm"] === false) {
          this.showConfirm = false;
      }
  }

  doConfirm(): void {
      this.dialogRef.close({ rs: true });
  }

  close(): void {
      this.dialogRef.close({ rs: false });
  }
}
