import { PapiClient } from '@pepperi-addons/papi-sdk';
import { ADDON_UUID, OpmData, OPM_CPI_META_DATA_TABLE_NAME } from './../shared/entities';
import { Transaction } from '@pepperi-addons/cpi-node';
import jwt from 'jwt-decode';
import config from '../addon.config.json';


export async function load(configuration: any) {
    console.log('cpi side works!');

    const opmConfigs: OpmData[] = (await pepperi.api.adal.getList({
        table: OPM_CPI_META_DATA_TABLE_NAME,
        addon: config.AddonUUID
    })).objects as OpmData[];
debugger
    // intercept for each atd that installed the addon
    opmConfigs.forEach(config => {
        const onlineDataManager = new OnlineDataCPIManager(config)
        onlineDataManager.load();        
    });

    
}

class OnlineDataCPIManager {
    orderDataObject: Transaction | undefined;
    papiBaseURL = ''
    opmConfig: OpmData | undefined

 
    async getPapiClient(): Promise<PapiClient> {
        return new PapiClient({
            baseURL: this.papiBaseURL,
            token: await pepperi.auth.getAccessToken(),
            addonUUID: ADDON_UUID,
            suppressLogging:true
        })
    }
    constructor(private atdConfig: OpmData){
        this.opmConfig = atdConfig;
        pepperi.auth.getAccessToken().then( accessToken => {
            const parsedToken: any = jwt(accessToken);
            this.papiBaseURL = parsedToken["pepperi.baseurl"] 
        });
    }

    load(){
        this.subsribe()
    }

    subsribe() {
        // TODO use reald filter, waiting for Roi
        const filter = {
            DataObject: {
                typeDefinition: {
                    internalID: this.opmConfig?.AtdID
                }
            }
        }
        console.table(filter);
        pepperi.events.intercept("PreLoadTransactionScope", filter, async (data, next, main) => {
            // TODO get order through another approaech, waiting for Roi
            // const orderUUID = data.orderUUID;
            // this.orderDataObject  = await pepperi.DataObject.Get("transactions", orderUUID)
            this.orderDataObject  = data.DataObject as Transaction
            if (this.opmConfig) {
                console.log("About to load online data for config:");
                console.table({ "PreLoadTransactionScope" : this.opmConfig });
                await this.handleOrderOnlineData()      
            } else {
                console.log("Online Config data isn't initialized");
            }         
            await next(main);
        })
    }
    async handleOrderOnlineData(){
        debugger
        const isOrderEditable = await this.isOrderEditable();
        // handle read only atds only if the user choosed to do that.
        if (isOrderEditable || !isOrderEditable && this.opmConfig?.EnableOnReadOnlyAtd) {
            const onlineData = await this.getOnlineData();
            await this.setOnlineData(onlineData);  
        }
    }
    async getOnlineData(){
        // call addon api to get online data        
        const acountExID = await this.orderDataObject?.getFieldValue("AccountExternalID")
        const catalogName = await this.orderDataObject?.catalog.getFieldValue("ID")
        const atdID = await this.orderDataObject?.getFieldValue("ActivityTypeDefinitionWrntyID")
        console.log(`getOnlineData - acountExID: ${acountExID}, catalogName: ${catalogName}, atdID: ${atdID}`);
        const papiClient = await this.getPapiClient();
        const onlineData = await papiClient.addons.api.uuid(ADDON_UUID).file('api').func('online_data').get(
            {atd_id: atdID, catalog_name: catalogName, account_ex_id: acountExID}
        )   
        return onlineData    
    }
    async isOrderEditable(){
        // return if order is editable
        const availableTransitions = await this.orderDataObject?.availableTransitions()
        const isOrderEditable = availableTransitions && availableTransitions?.length > 0 
        console.log('availableTransitions :>> ', availableTransitions);
        console.log('isOrderEditable :>> ', isOrderEditable);
        return isOrderEditable;
    }
    async setOnlineData(onlineData){
        if (this.opmConfig!.DestinationField != "") {
            console.log(`about to setOnlineData to DestinationField: ${this.opmConfig!.DestinationField}`);
            this.orderDataObject?.setFieldValue(this.opmConfig!.DestinationField, onlineData);            
        } else {
            console.log("DestinationField is missing");
        }

    }
}