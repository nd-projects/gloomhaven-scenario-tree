import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { FormControl, Validators, ValidatorFn, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetService } from '../asset.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-import-export-dialog',
    templateUrl: './import-export-dialog.html',
    styles: [`
  mat-form-field {
    width: 100%;
  }
  mat-form-field textarea {
    height: 150px;
  }
  `],
    standalone: true,
    imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ImportExportDialogComponent {
    public scenarios: any;
    public encodedScenarios = new FormControl('', [Validators.required, this.validJSONValidator()]);
    public importError: String | null = null;
    constructor(
        public dialogRef: MatDialogRef<ImportExportDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public assetService: AssetService) {
        this.scenarios = data.scenarios;
        this.encodedScenarios.setValue(this.assetService.getEncodedScenarios(this.scenarios));
    }
    public importScenarios(): void {
        this.importError = null;
        try {
            const decodedScenarioJSON = this.assetService.getDecodedScenarios(this.scenarios.nodes, this.encodedScenarios.value || '');
            this.dialogRef.close(decodedScenarioJSON);
        } catch (e) {
            this.importError = 'Not a valid scenario JSON.';
        }
        this.encodedScenarios.updateValueAndValidity();
    }
    private validJSONValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            return this.importError != null ? { 'validJSON': { value: this.importError } } : null;
        };
    }
}

@Component({
    selector: 'app-export-tree',
    templateUrl: './export-tree.component.html',
    styleUrls: ['./export-tree.component.css'],
    standalone: true,
    imports: [MaterialModule, CommonModule]
})
export class ExportTreeComponent implements OnInit {
    @Input() scenarios: any;
    @Output() importScenarios = new EventEmitter();
    constructor(
        public dialog: MatDialog
    ) { }

    ngOnInit() {
    }
    public showImportExportModal() {
        const dialogRef = this.dialog.open(ImportExportDialogComponent, {
            width: '600px',
            height: '75vh',
            data: { scenarios: this.scenarios }
        });
        dialogRef.afterClosed().subscribe((scenarios: any) => {
            if (scenarios) {
                this.importScenarios.emit(scenarios);
            }
        });
    }
}
