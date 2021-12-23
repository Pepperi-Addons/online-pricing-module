import OpmService from './opm-service'
import { Client, Request } from '@pepperi-addons/debug-server'


export async function install(client: Client, request: Request) {
    const service = new OpmService(client)
    let res;
    if (request.method === 'POST') {
        res = await service.installOpm(request.body)
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }    
    return res
};

export async function uninstall(client: Client, request: Request) {
    const service = new OpmService(client)
    let res;

    if (request.method === 'POST') {
        res = await service.uninstallOpm(request.body)
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }
    
    return res
};

export async function online_data(client: Client, request: Request) {
    const service = new OpmService(client)
    let res = {};
    if (request.method === 'GET') {
        res = await service.getOnlineData(request.query); 
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }

    return res
}

export async function opm_data(client: Client, request: Request) {
    
    const service = new OpmService(client)
    let res = {};
    if (request.method === 'GET') {

        res = await service.getOpmData(request.query);  

    } else if (request.method === 'POST') {

        res = await service.upsertOpmData(request.body)
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }

    if (!res || Object.keys(res).length === 0) { // opm is not installed on this atd
        res = {
            success: false,
            errorMessage: 'opm is not installed on this atd',
        }
    }
    
    return res
}

export async function opm_destination_field_options(client: Client, request: Request) {
    
    const service = new OpmService(client)
    let res = {};
    if (request.method === 'GET') {
        try {
            res = await service.getDestinationFieldOptions(request.query);            
        } catch (error) {
            console.log("opm not installed");
        }        
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }

    
    return res
}

export async function import_online_data_config(client: Client, request:Request) {
    const service = new OpmService(client)
    if (request.method == 'POST') {
        return service.importConfig(request.body);
    }
    else if (request.method == 'GET') {
        throw new Error(`Method ${request.method} not supported`);       
    }
}

export async function export_online_data_config(client: Client, request:Request) {
    const service = new OpmService(client)
    if (request.method == 'GET') {
        return service.exportConfig(request.query);
    }
    else if (request.method == 'POST') {
        throw new Error(`Method ${request.method} not supported`);       
    }
}
export async function test(client: Client, request: Request) {
    
    let res = {};
    if (request.method === 'POST') {
        res = {
            hello: "world"
        };       
    }
    else {
        throw new Error(`Method ${request.method} not supported`);
    }
    
    return res
}