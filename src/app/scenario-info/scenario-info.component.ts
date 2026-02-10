import { Component, OnInit, Input, OnChanges, EventEmitter, Output, Inject } from '@angular/core';
import { AssetService } from '../asset.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import cloneDeep from 'lodash.clonedeep';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { KeyComponent } from '../key/key.component';

@Component({
    selector: 'app-scenario-info-dialog',
    templateUrl: './scenario-info-dialog.html',
    styles: [`
    .mat-dialog-content {
        max-height: 85vh !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        height: 85vh !important;
        display: block !important;
        overflow-y: auto !important;
        background-color: #222;
    }
    .scenario-image {
      width: 100%;
      height: auto;
      display: block;
    }
  `],
    standalone: true,
    imports: [MaterialModule, CommonModule]
})
export class ScenarioInfoDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrls: string[] }) { }
}

@Component({
    selector: 'app-scenario-info',
    templateUrl: './scenario-info.component.html',
    styleUrls: ['./scenario-info.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        KeyComponent
    ]
})
export class ScenarioInfoComponent implements OnInit, OnChanges {
    @Input() selectedScenario: any;
    @Input() scenarios: any;
    @Output() selectScenario = new EventEmitter();
    @Output() updateScenario = new EventEmitter<any>();
    filteredScenarios!: Observable<any[]>;
    scenarioCtrl = new FormControl();
    selectedTab = new FormControl(1);
    public scenario: any = {
        id: '',
        status: 'incomplete',
        notes: '',
        treasure: {}
    };
    public treasureArray: any[] = [];
    constructor(
        public assetService: AssetService,
        private snackBar: MatSnackBar,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.filteredScenarios = this.scenarioCtrl.valueChanges
            .pipe(
                startWith<any>(''),
                map(value => typeof value === 'string' ? value : value.data.name),
                map(scenario => scenario ? this.filterScenarios(scenario) : this.scenarios.nodes.slice())
            );
    }
    ngOnChanges() {
        if (this.selectedScenario !== null && typeof this.selectedScenario !== 'undefined') {
            this.scenario.id = this.selectedScenario.id;
            this.scenario.status = this.selectedScenario.status || 'incomplete';
            this.scenario.notes = this.selectedScenario.notes || '';
            this.scenario.treasure = cloneDeep(this.selectedScenario.treasure);
            this.treasureArray = this.treasureArrayFromObject(this.selectedScenario.treasure);
            this.selectedTab.setValue(0);
        }
    }
    public isSideScenario() {
        return (parseInt(this.scenario.id, 10) > 51);
    }
    public showScenarioName(node: any) {
        return (node.data.status !== 'locked' && node.data.status !== 'hidden');
    }
    public handleStatusChange(status: any) {
        this.scenario.status = status;
        this.saveScenarioData(false);
    }
    public handleTreasureChange($event: any, id: any) {
        this.scenario.treasure[id].looted = $event.checked;
        this.saveScenarioData(false);
    }
    public handleScenarioSelect($event: any) {
        this.selectScenario.emit($event.option.value);
        this.scenarioCtrl.patchValue('');
    }
    public getImageUrl(page: string) {
        return this.assetService.getImageUrl(page);
    }
    public showScenarioModal(imageUrls: string[]) {
        this.dialog.open(ScenarioInfoDialogComponent, {
            data: { imageUrls },
            width: '50vw',
            height: '85vh',
            maxWidth: '90vw',
            maxHeight: '90vh',
            panelClass: 'full-screen-modal'
        });
    }
    public clearScenario() {
        this.scenarioCtrl.patchValue('');
        this.selectScenario.emit(null);
    }
    public saveScenarioData(showSnackBar: boolean) {
        this.updateScenario.emit(this.scenario);
        if (showSnackBar) {
            this.snackBar.open('Notes Saved!', '', {
                duration: 1500,
            });
        }
    }
    public unlockScenario() {
        this.scenario.status = 'incomplete';
        this.saveScenarioData(false);
    }
    public lockScenario() {
        this.scenario.status = 'locked';
        this.saveScenarioData(false);
    }
    public unhideScenario() {
        this.scenario.status = 'incomplete';
        this.saveScenarioData(false);
    }
    public hideScenario() {
        this.scenario.status = 'hidden';
        this.saveScenarioData(false);
    }
    public displayFn(scenario: any) {
        return scenario ? scenario.data.name : undefined;
    }
    private filterScenarios(value: string) {
        const filterValue = value.toLowerCase();
        return this.scenarios.nodes.filter((node: any) => node.data.name.toLowerCase().includes(filterValue));
    }
    private treasureArrayFromObject(treasureObject: any) {
        return Object.keys(treasureObject).map(number => ({
            id: number,
            looted: treasureObject[number].looted.toString() === 'true',
            description: treasureObject[number].description
        }));
    }
}
