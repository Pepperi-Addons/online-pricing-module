import { OpmData } from './../../../../../shared/entities';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import {  map } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { PepLayoutService, PepScreenSizeType, PepLoaderService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { AddonService} from './index';
import { Observable } from 'rxjs';
import { InstalledAddon } from '@pepperi-addons/papi-sdk';
import { event } from 'jquery';

@Component({
  selector: 'addon-module',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss'],
  providers: [TranslatePipe]
})
export class AddonComponent implements OnInit {

    screenSize: PepScreenSizeType;
    @Input() hostObject: any;
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    showLoading = false;
    // is addon installed on this ATD
    isInstalled: boolean = false;
    isLoaded: boolean = false;
    
    atdUUID: string;
    atdID: number;
    constructor(
        public addonService: AddonService,
        public layoutService: PepLayoutService,
        public dialog: PepDialogService,
        public translate: TranslateService,
        public loaderService: PepLoaderService,
        public customizationService: PepCustomizationService,


    ) {

        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });
        this.loaderService.onChanged$
        .subscribe((show) => {
            this.showLoading = show;
        });

    }

    ngOnInit(){
        // known issue, use hardcoded addon uuid
        this.addonService.addonUUID = "9d047fdc-f151-47b5-b19f-54bcdb35ef3d";
        this.atdUUID = this.hostObject.objectList[0];
        this.addonService.getAtdId(this.atdUUID).then(
            typeID => {
                this.atdID = typeID;
                this.addonService.getOpmData(this.atdID).then(
                    data => {
                        this.addonService.opmData = data
                        this.isInstalled = this.isOpmInstalled(this.addonService.opmData)
                        this.isLoaded = true;
                    });
            }
        );
    }

    private isOpmInstalled(opmData: OpmData){
        let isInstalled = false;
        if (opmData.Key) {
            isInstalled = true
        }
        return isInstalled;
    }

    onInstallation($event){
        this.isInstalled = !!$event;   
        this.ngOnInit();     
    }

}
