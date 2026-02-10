import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material.module';
import { SettingsService } from '../settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-key',
    templateUrl: './key.component.html',
    styleUrls: ['./key.component.css'],
    standalone: true,
    imports: [MaterialModule, CommonModule, FormsModule]
})
export class KeyComponent implements OnInit {

    constructor(public settingsService: SettingsService) { }

    ngOnInit() {
    }

    onPreviewModeChange(value: boolean) {
        this.settingsService.setPreviewMode(value);
    }

}
