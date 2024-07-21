/**
 * TODO: there are other filters that could be added
 * 
 * https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_DATAPUMP.html#GUID-E75AAE6F-4EA6-4737-A752-6B62F5E9D460
 */
export type TableDataExport = {
    schema: string
    table: string
    /** This is a valid where clause for the particular table */
    where: string
} | {
    schema: string
    table: string
    /** This is used to sample the number of records for testing purposes */
    sample: number
}

export interface DataPumpContext {
    /** The variable name for the data pump handle that was assigned via dbms_datapump.open() */
    dataPumpHandle: string
    /** The name of an oracle directory that has already been created for data pump purposes */
    directory: string
    /** The name of the data pump job */
    jobName: string
    /** The job mode that this data pump is used for */
    jobMode: 'FULL' | 'SCHEMA' | 'TABLE' | 'TABLESPACE' | 'TRANSPORTABLE'
}