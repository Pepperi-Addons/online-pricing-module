//relation array that needed for opm
import { OPM_CPI_META_DATA_TABLE_NAME, Relation } from "../shared/entities"
import { AddonDataScheme, ApiFieldObject } from "@pepperi-addons/papi-sdk"
export const relations: Relation[] = [
    // {
    //     RelationName: "ATDImport",
    //     AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
    //     Name:"UomRelations",
    //     Description:"Relation from Uom addon to ATD Import addon",
    //     Type:"AddonAPI",
    //     AddonRelativeURL:"/api/import_uom"
    // },
    // {
    //     RelationName: "ATDExport",
    //     AddonUUID: "1238582e-9b32-4d21-9567-4e17379f41bb",
    //     Name:"UomRelations",
    //     Description:"Relation from Uom addon to ATD Export addon",
    //     Type:"AddonAPI",
    //     AddonRelativeURL:"/api/export_uom"
    // },
    {   
        //meta data for realtion of type NgComponent
        RelationName: "TransactionTypeListTabs",
        AddonUUID: "9d047fdc-f151-47b5-b19f-54bcdb35ef3d",
        Name:"OpmRelations",
        Description:"Online Data",
        SubType: "NG11",
        ModuleName: "AddonModule",
        ComponentName: "AddonComponent",
        Type:"NgComponent",
        AddonRelativeURL:"opm_config"
    },
]

export const OpmDataScheme: AddonDataScheme = {
    Name: OPM_CPI_META_DATA_TABLE_NAME,
    Type: "cpi_meta_data",
}