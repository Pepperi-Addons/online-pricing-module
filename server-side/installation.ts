
/*
The return object format MUST contain the field 'success':
{success:true}

If the result of your code is 'false' then return:
{success:false, erroeMessage:{the reason why it is false}}
The error Message is importent! it will be written in the audit log and help the user to understand what happen
*/

import { Client, Request } from '@pepperi-addons/debug-server'
import { PapiClient } from '@pepperi-addons/papi-sdk'
import { OpmDataScheme, relations } from './metadata';

export async function install(client: Client, request: Request): Promise<any> {
    const papiClient = new PapiClient({
        baseURL: client.BaseURL,
        token: client.OAuthAccessToken,
        addonUUID: client.AddonUUID,
        addonSecretKey: client.AddonSecretKey
    });

    const adalRes = await createADALSchemes(papiClient);
    const relationsRes = await createRelations(papiClient, relations);

    return {
        success: adalRes.success && relationsRes.success,
        errorMessage: `adalRes: ${adalRes.errorMessage}, relationsRes:  ${relationsRes.errorMessage}`
    };
}

export async function uninstall(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function upgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

export async function downgrade(client: Client, request: Request): Promise<any> {
    return {success:true,resultObject:{}}
}

async function createRelations(papiClient: PapiClient, relations) {
    try {
        relations.forEach(async (singleRelation) => {
            await papiClient.post('/addons/data/relations', singleRelation);
        });
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: (err instanceof TypeError && 'message' in err) ? err.message : 'Unknown Error Occured',
        }
    }
}
async function createADALSchemes(papiClient: PapiClient) {
    try {
        await papiClient.addons.data.schemes.post(OpmDataScheme);
        return {
            success: true,
            errorMessage: ""
        }
    }
    catch (err) {
        return {
            success: false,
            errorMessage: (err instanceof TypeError && 'message' in err) ? err.message : 'Unknown Error Occured',
        }
    }
}