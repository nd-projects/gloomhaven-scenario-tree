import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { KeyComponent } from './key.component';

@Component({
    selector: 'app-key-dialog',
    template: `
    <h2 mat-dialog-title style="font-family: 'Pirata One', cursive; color: #d4c5a9;">Legend & Settings</h2>
    <mat-dialog-content>
      <app-key></app-key>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close style="color: #4a9e8e;">Close</button>
    </mat-dialog-actions>
  `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, KeyComponent]
})
export class KeyDialogComponent {
    constructor(public dialogRef: MatDialogRef<KeyDialogComponent>) { }
}
