import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { OpmData, OPM_CPI_META_DATA_TABLE_NAME, DUMMY_PASSWORD } from '../shared/entities'
import * as encryption from '../shared/encryption-service'
class OpmService {

    papiClient: PapiClient
    addonUUID: string;
    addonSecretKey: string
    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client["ActionUUID"]
        });
        this.addonSecretKey = client.AddonSecretKey ?? "";
        this.addonUUID = client.AddonUUID;

    }
    async installOpm(opmData: OpmData){
        let res = {};
        if (opmData.AtdID) {
            opmData.Key = opmData.AtdID.toString();
            res = await this.papiClient.addons.data.uuid(this.addonUUID).table(OPM_CPI_META_DATA_TABLE_NAME).upsert(opmData);
            return this.setDummyPasswordIfNeeded(res)
        }
        else {
            throw new Error(`AtdID is required`);
        }

    }
    async uninstallOpm(opmData: OpmData){
        let res = {};
        if (opmData.AtdID) {
            opmData.Key = opmData.AtdID.toString()
            opmData.Hidden = true;
            res = await this.papiClient.addons.data.uuid(this.addonUUID).table(OPM_CPI_META_DATA_TABLE_NAME).upsert(opmData);
            return this.setDummyPasswordIfNeeded(res)
        }
        else {
            throw new Error(`AtdID is required`);
        }
    } 
    // return opm data obj with dummy passwaord
    async getOpmData(query: any){
        const atdId = query.atd_id
        let opmData = await this.getOpmDataInternal(atdId);        
        return this.setDummyPasswordIfNeeded(opmData)
    }
    // return opm data with encrypted password
    async getOpmDataInternal(atdId: any){
        let opmData = {}; 
        if (atdId) {
            try {
                opmData = await this.papiClient.addons.data.uuid(this.addonUUID).table(OPM_CPI_META_DATA_TABLE_NAME).key(atdId).get()/*as OpmData*/;                
            } catch (error) {
                console.log("opm not installed");
            }
        }
        return opmData;
    }
    async upsertOpmData(opmData: OpmData){
        let res = {};
        if (this.validateOpmData(opmData)) {
            opmData = await this.handlePassword(opmData)
            opmData.Key = opmData.AtdID.toString();
            res = await this.papiClient.addons.data.uuid(this.addonUUID).table(OPM_CPI_META_DATA_TABLE_NAME).upsert(opmData);   
        }
        return this.setDummyPasswordIfNeeded(res);
    }
    // in case the object have a dummy passwork, we need to take care and dont save it.
    // so when we have a dummy password, we remove it from the object, and the upsert to ADAL will not change the current password
    async handlePassword(newOpmData: any){
        const pswd: string = newOpmData.Password;
        const currentOpmData = await this.getOpmDataInternal(newOpmData.AtdID) as any
        if (pswd == DUMMY_PASSWORD) {
            if (currentOpmData.Password.length > 0) {
                delete newOpmData.Password // remvoe the dummy and leave the current                
            }
            else {
                throw new Error(`Password cann't be ${newOpmData.Password}`);
            }
        }
        else if (pswd.length > 0 ) { // real password
            newOpmData.Password = encryption.encryptPassword(pswd, this.addonSecretKey)            
        }
        return newOpmData
    }

    validateOpmData(opmData: OpmData){
        if (opmData.AtdID) {
            if (opmData.URL?.length > 0 
                && opmData.User?.length > 0
                && opmData.Password?.length > 0
                && opmData.DestinationField?.length > 0) { 
                    return true                
            }
            else {
                throw new Error(`Please fill mandatory fields`);
            }
        }
        else {
            throw new Error(`AtdID is missing`);
        }
    }

    async getDestinationFieldOptions(query: any){
        const atdId = query.atd_id
        let opmDestinationOptions: any[] = [] 
        if (atdId) {
            opmDestinationOptions = await this.papiClient.get(`/meta_data/transactions/types/${atdId}/fields`);
            opmDestinationOptions = opmDestinationOptions.filter(
                field =>field.Format === "String" && 
                        field.CalculatedRuleEngine != null && 
                        field.CalculatedRuleEngine.Temporary == true)
        }

        return opmDestinationOptions.map(item => {
            return {
                value: item.FieldID,
                key: item.FieldID
            }
        });        
    }
    
    setDummyPasswordIfNeeded(opmData: any) {        
        if (opmData?.Password?.length > 0) {
            opmData.Password = DUMMY_PASSWORD;
        }
        return opmData;
    }
}

export default OpmService;