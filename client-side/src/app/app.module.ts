import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { PepUIModule } from './modules/pepperi.module';
import { MaterialModule } from './modules/material.module';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PepUIModule,
        MaterialModule
    ],
    providers: [],
    // entryComponents: [
    //     DataRetentionComponent,
    //     AddTypeDialogComponent,
    //     ReportDialogComponent
    // ],
    bootstrap: [AppComponent]
})
export class AppModule {
}




