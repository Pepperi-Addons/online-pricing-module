export const ADDON_UUID = "9d047fdc-f151-47b5-b19f-54bcdb35ef3d";
export const OPM_CPI_META_DATA_TABLE_NAME = 'OpmData';
export const DUMMY_PASSWORD = "••••••••••"
export interface Relation {
    RelationName: string;
    AddonUUID: string;
    Name: string;
    Description: string;
    Type: "AddonAPI" | "NgComponent" | "Navigation";
    [key:string]:string;
}

export interface OpmData {
    AtdID: number,
    Key: string // the key is the same as AtdId. this is for adal indexing.
    URL: string,
    User : string,
    Password: string,
    DestinationField: string,
    EnableOnReadOnlyAtd?: boolean,
    Hidden?: boolean
}

export class AtdExportResponse {
    success: boolean;
    DataForImport: {};
    
    constructor(success : boolean, obj: {}){
        this.success = success;
        this.DataForImport = obj;
    }
}