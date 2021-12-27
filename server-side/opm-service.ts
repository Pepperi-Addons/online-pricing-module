import { PapiClient, InstalledAddon } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';
import { AtdExportResponse, OpmData, OPM_CPI_META_DATA_TABLE_NAME, DUMMY_PASSWORD } from '../shared/entities'
import * as encryption from '../shared/encryption-service'
import * as https from "https"
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
        let opmData: OpmData | undefined; 
        if (atdId) {
            try {
                opmData = await this.papiClient.addons.data.uuid(this.addonUUID).table(OPM_CPI_META_DATA_TABLE_NAME).key(atdId).get()as OpmData;                
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

    // in case the object have a dummy password, we need to take care and don't save it.
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

    // return optianal TSAs that can be stored the online data.
    // only temporary string TSAs will return.
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

    async getOnlineData(query){
        let [accountExternalID, catalogName, atdId] = [query.account_ex_id, query.catalog_name, query.atd_id]
        const isAccountAutorizedToUser = await this.isAccountAutorizedToUser(accountExternalID)
        if (!isAccountAutorizedToUser) {
            throw new Error(`user is not authorized to get data for account ${accountExternalID}`); // should throw 404 error
        }
        console.table({"getOnlineData": query});
        let onlineData:any = {};
        const opmData = await this.getOpmDataInternal(atdId); 
        const username = opmData?.User;
        const password = encryption.decryptPassword(opmData!.Password, this.addonSecretKey);

        const body = {
            "account": accountExternalID,
            "catalog": catalogName,
            "orderItems": []
        }    
        
        try {
            onlineData = await this.httpsPost(opmData?.URL, body, username, password)
            
        } catch (error) {
            
        }

        return onlineData    

    }

    async isAccountAutorizedToUser(accountExternalID){
        let res = []
        res = await this.papiClient.get(`/accounts?where=ExternalID='${accountExternalID}'`);
        return res.length != 0;
    }

    // Import / Expoort
    async importConfig(body) {
        try {
            console.log('importConfig is called, data got from call:', body);
            if (body && body.Resource == 'transactions') {
                let objectToimport = body.DataFromExport;
                // set the atd id of the current atd.
                objectToimport.AtdID = Number(body.InternalID)
                this.installOpm(objectToimport);
                return {
                    success: true
                }
            } else {
                return {
                    success: false
                }
            }
            
        }
        catch (err) {
            console.log('importConfig Failed with error:', err);
            return {
                success: false,
                errorMessage: 'message' in (err as Error) ? (err as Error).message : 'unknown error occured'
            }
        }
    }

    async exportConfig(query) {
        let objectToReturn: AtdExportResponse = new AtdExportResponse(true, {});
        console.log('Export Online Data - query:', query);
        if (query && query.resource  == 'transactions') {
            const onlineDataConfig = await this.getOpmDataInternal(query.internal_id) as any;
            if (onlineDataConfig?.Password) {
                delete onlineDataConfig.Password // remvoe password             
            }
            objectToReturn.DataForImport = onlineDataConfig ?? {}
        }
        console.table({"exportConfig": objectToReturn});
        return objectToReturn;
    }

    // https POST request [using https module]
    async httpsPost(url, data, username, password) {
        const dataString = JSON.stringify(data)
      
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length,
            'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`, 'binary').toString('base64')

          },
          timeout: 5000, // in ms
        }
      
        return new Promise((resolve, reject) => {
          const req = https.request(url, options, (res: any) => {
            if (res.statusCode < 200 || res.statusCode > 299) {
              return reject(new Error(`HTTP status code ${res.statusCode}`))
            }
      
            const body:any = []
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
              const resString = Buffer.concat(body).toString()
              resolve(resString)
            })
          })
      
          req.on('error', (err) => {
            reject(err)
          })
      
          req.on('timeout', () => {
            req.destroy()
            reject(new Error('Request time out'))
          })
      
          req.write(dataString)
          req.end()
        })
    }      
}

export default OpmService;