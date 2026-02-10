import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material.module';

@Component({
    selector: 'app-key',
    templateUrl: './key.component.html',
    styleUrls: ['./key.component.css'],
    standalone: true,
    imports: [MaterialModule]
})
export class KeyComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
