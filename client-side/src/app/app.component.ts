import { Observable, of } from 'rxjs';
import { AddonService } from './components/addon/addon.service';
import { Component, OnInit } from '@angular/core';
import { PepCustomizationService, PepLoaderService, PepStyleType } from '@pepperi-addons/ngx-lib';

@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    footerHeight: number;
    showLoading = false;
    addon$: Observable<any>;


    constructor(
        public customizationService: PepCustomizationService,
        public loaderService: PepLoaderService,
        public addonService: AddonService
    ) {
        this.loaderService.onChanged$
            .subscribe((show) => {
                this.showLoading = show;
            });
    }

    ngOnInit() {
       
    }


}
