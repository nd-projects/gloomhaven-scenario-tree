import { Component, OnInit } from '@angular/core';
import { AssetService } from './asset.service';
import { TreeLogicService } from './tree-logic.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportTreeComponent } from './export-tree/export-tree.component';
import { ScenarioInfoComponent } from './scenario-info/scenario-info.component';
import { TreeComponent } from './tree/tree.component';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KeyDialogComponent } from './key/key-dialog.component';
import { SettingsService } from './settings.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    FormsModule,
    ExportTreeComponent,
    ScenarioInfoComponent,
    TreeComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class AppComponent implements OnInit {
  public scenarios: any;
  public selectedScenario: any = null;

  constructor(
    private assetService: AssetService,
    private treeLogicService: TreeLogicService,
    private snackBar: MatSnackBar,
    public settingsService: SettingsService,
    private dialog: MatDialog
  ) { }
  ngOnInit() {
    this.assetService.getScenariosJSON().subscribe((scenarios: any) => this.scenarios = scenarios);
  }
  public handleScenarioSelect(scenario: any) {
    if (scenario) {
      const rawScenario = (typeof scenario.data === 'function') ? scenario.data() : scenario.data;
      // Cytoscape data() returns a copy, so updating it doesn't update graph data directly unless put back?
      // Legacy code assumed this worked.
      // But wait, AssetService.getImageUrl uses logic.
      // Legacy: rawScenario.activePage = rawScenario.pages[0];
      // Note: 'pages' property might exist on data object from JSON.
      if (!rawScenario.activePage && rawScenario.pages && rawScenario.pages.length > 0) {
        rawScenario.activePage = rawScenario.pages[0];
      }
      if (rawScenario.activePage) {
        rawScenario.imageUrl = this.getImageUrl(rawScenario.activePage);
      }
      this.selectedScenario = rawScenario;
      /* Call this in case user drags the scenario. This will save it even if they make no other changes */
      this.scenarios = this.treeLogicService.updateScenario(this.scenarios, this.selectedScenario);
      this.assetService.setScenariosJSON(this.scenarios);
    } else {
      this.selectedScenario = null;
    }
  }
  public getNextScenarioPage() {
    // This function was in AppComponent but also ScenarioInfoDialogComponent?
    // In legacy AppComponent it was present but seemingly unused in template?
    // Let's keep it if logic calls it, but ScenarioInfoDialogComponent seems to have its own.
    const pages = this.selectedScenario.pages;
    let activeIndex = pages.indexOf(this.selectedScenario.activePage);
    activeIndex++;
    if (activeIndex === pages.length) {
      activeIndex = 0;
    }
    this.selectedScenario.activePage = pages[activeIndex];
    this.selectedScenario.imageUrl = this.getImageUrl(this.selectedScenario.activePage);
  }
  public handleScenarioUpdate(changedScenario: any) {
    this.scenarios = this.treeLogicService.updateScenario(this.scenarios, changedScenario);
    this.assetService.setScenariosJSON(this.scenarios);
    this.handleScenarioSelect(this.scenarios.nodes.find((scenario: any) => scenario.data.id === changedScenario.id));
  }
  public handleScenariosImport(scenarios: any) {
    scenarios.edges = this.scenarios.edges;
    this.scenarios = scenarios;
    this.assetService.setScenariosJSON(this.scenarios);
    this.snackBar.open('Scenarios Imported!', '', {
      duration: 1500,
    });
  }
  private getImageUrl(activePage: any) {
    return `assets/scenarios/${activePage}.jpg`;
  }

  public openKeyDialog() {
    this.dialog.open(KeyDialogComponent, {
      width: '400px'
    });
  }
}
