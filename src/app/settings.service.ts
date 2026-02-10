import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private _previewMode = new BehaviorSubject<boolean>(false);
    public previewMode$ = this._previewMode.asObservable();

    constructor() { }

    setPreviewMode(value: boolean) {
        this._previewMode.next(value);
    }

    get previewMode(): boolean {
        return this._previewMode.value;
    }
}
