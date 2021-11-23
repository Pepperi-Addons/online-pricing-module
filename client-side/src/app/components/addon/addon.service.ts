import { TranslateService } from '@ngx-translate/core';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { OpmData } from './../../../../../shared/entities';
import { Observable } from 'rxjs';
import jwt from 'jwt-decode';
import { PapiClient } from '@pepperi-addons/papi-sdk';
import { Injectable } from '@angular/core';
import {PepHttpService, PepDataConvertorService, PepSessionService} from '@pepperi-addons/ngx-lib';


@Injectable({ providedIn: 'root' })
export class AddonService {

    accessToken = '';
    parsedToken: any
    papiBaseURL = ''
    addonUUID;
    opmData: OpmData;
    destinationFieldoptions = [];
    get papiClient(): PapiClient {
        return new PapiClient({
            baseURL: this.papiBaseURL,
            token: this.session.getIdpToken(),
            addonUUID: this.addonUUID,
            suppressLogging:true
        })
    }

    constructor(
        private translate: TranslateService,
        public session:  PepSessionService,
        public pepperiDataConverter: PepDataConvertorService,
        private pepHttp: PepHttpService,
        private dialogService: PepDialogService
    ) {
        const accessToken = this.session.getIdpToken();
        this.parsedToken = jwt(accessToken);
        this.papiBaseURL = this.parsedToken["pepperi.baseurl"]
    }

    uninstallOpm(atdID: number){
        let obj = {
            AtdID: atdID
        }
        return this.papiClient.addons.api.uuid(this.addonUUID).file('api').func('uninstall').post(undefined, obj)
    }

    installOpm(atdID: number){
        let obj = {
            AtdID: atdID
        }             
        return this.papiClient.addons.api.uuid(this.addonUUID).file('api').func('install').post(undefined, obj)
    }


    async getOpmData(atdID: number){
        let opmData: OpmData;
        try {
            opmData = await this.papiClient.addons.api.uuid(this.addonUUID).file('api').func('opm_data').get({atd_id: atdID})            
        } catch (error) {
            
        }
        return opmData ;
    }

    async loadOpmDestinationFields(atdID: number) {
        let opmDestinationFields = []
        try {
            opmDestinationFields = await this.papiClient.addons.api.uuid(this.addonUUID).file('api').func('opm_destination_field_options').get({atd_id: atdID})            
        } catch (error) {
            opmDestinationFields = []
        }
        this.destinationFieldoptions = opmDestinationFields;
    }

    async saveOpmData(){
        let res = {};
        try {
            res = await this.papiClient.addons.api.uuid(this.addonUUID).file('api').func('opm_data').post(undefined, this.opmData)  
            this.opmData = res as OpmData;                       
        } catch (error) {
            const alertTitle =  await this.translate.get('Save_Data_Error_Title').toPromise();
            this.showAlert(alertTitle , error?.message ? error?.message : "error"  )   
        } 
        return res;
    } 
    
    async getAtdId(uuid: string) {
        return  await this.papiClient.types.find({
            where: `UUID='${uuid}'`
        }).then((types) => {
            console.log('uuid is' + uuid + 'types is', types);
            return types[0].InternalID
        });
    }

    showAlert(title: string, message: string){
        const content = message; 
        const dataMsg = new PepDialogData({title, actionsType: "close", content});
        this.dialogService.openDefaultDialog(dataMsg);
    }
}
