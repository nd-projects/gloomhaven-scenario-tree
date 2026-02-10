import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AssetService } from './asset.service';
import { TreeLogicService } from './tree-logic.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockAssetService {
  getScenariosJSON() {
    return of({ nodes: [], edges: [] });
  }
  setScenariosJSON(scenarios: any) { }
  getEncodedScenarios(scenarios: any) { return ''; }
  getDecodedScenarios(nodes: any, encoded: any) { return {}; }
  getImageUrl(page: any) { return ''; }
}

class MockMatSnackBar {
  open(message: string, action: string, config: any) { }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        { provide: AssetService, useClass: MockAssetService },
        TreeLogicService,
        { provide: MatSnackBar, useClass: MockMatSnackBar }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
