import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { OpmConfigComponent } from './../opm-config/opm-config.component';
import { InstallComponent } from './../install/install.component';
import { MatCardModule } from '@angular/material/card';
import { PepListModule } from '@pepperi-addons/ngx-lib/list';
import { AddonService } from './addon.service';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepHttpService, PepFileService, PepNgxLibModule, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { AddonComponent } from './index';
import { MatDialogModule } from '@angular/material/dialog';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

export function createTranslateLoader(http: HttpClient, fileService: PepFileService, addonService: PepAddonService) {
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();
    const addonStaticFolder = addonService.getAddonStaticFolder();

    return new MultiTranslateHttpLoader(http, [
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + translationsPath
                    : translationsPath,
            suffix: translationsSuffix,
        },
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + "assets/i18n/"
                    : "/assets/i18n/",
            suffix: ".json",
        },
    ]);
}

@NgModule({
    declarations: [
        AddonComponent,
        InstallComponent,
        OpmConfigComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MatDialogModule,
        MatCardModule,
        PepTextboxModule,
        PepCheckboxModule,
        //// When not using module as sub-addon please remark this for not loading twice resources
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient, fileService: PepFileService, addonService: PepAddonService) =>
                    PepAddonService.createDefaultMultiTranslateLoader(http, fileService, addonService, "9d047fdc-f151-47b5-b19f-54bcdb35ef3d"),
                deps: [HttpClient, PepFileService, PepAddonService]
            }, isolate: false
        }),
        //// Example for importing tree-shakeable @pepperi-addons/ngx-lib components to a module
        PepNgxLibModule,
        PepButtonModule,
        PepSelectModule,
        PepTopBarModule,
        PepListModule


    ],
    exports:[AddonComponent],
    providers: [
        AddonService,
        HttpClient,
        TranslateStore,
        PepHttpService,
        PepAddonService,
        PepFileService,
        PepCustomizationService,
        PepDialogService
    ]
})
export class AddonModule {
    constructor(
          translate: TranslateService,
          private pepAddonService: PepAddonService
      ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
       
    }
}
