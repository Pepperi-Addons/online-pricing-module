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