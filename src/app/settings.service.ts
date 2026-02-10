import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private _debugMode = new BehaviorSubject<boolean>(false);
    public debugMode$ = this._debugMode.asObservable();

    constructor() { }

    setDebugMode(value: boolean) {
        this._debugMode.next(value);
    }

    get debugMode(): boolean {
        return this._debugMode.value;
    }
}
