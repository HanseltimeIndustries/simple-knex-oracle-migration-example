import { renderAddExpFile } from "./renderAddExpFile"
import { renderAddLogFile } from "./renderAddLogFile"
import { renderOpen } from "./renderOpen"
import { renderTableFilters } from "./renderTableFilters"
import { schemaFilter } from "./schemaFilter"
import { tableFilter } from "./tableFilter"
import { DataPumpContext, TableDataExport } from "./types"



/**
 * Simple Query builder to create a complex data pump script that exports specific data per table
 * via the dbms_datapump API.
 * 
 * Note, there are missing features that can be implemented as necessary
 */
export class TableDataExportBuilder {
    schemaMap = new Map<string, Map<string, TableDataExport>>()
    tableNames = new Set<string>()
    procedureName: string

    constructor(procedureName: string) {
        this.procedureName = procedureName
    }

    addTable(entry: TableDataExport) {
        if (!this.schemaMap.has(entry.schema)) {
            this.schemaMap.set(entry.schema, new Map<string, TableDataExport>()) 
        }
        const tablesMap = this.schemaMap.get(entry.schema)!
        if (tablesMap.has(entry.table)) {
            throw new Error(`You can only supply one entry for ${entry.schema}.${entry.table}`)
        }
        tablesMap.set(entry.table, entry)
        this.tableNames.add(entry.table)

        return this
    }

    build() {
        const schemas = Array.from(this.schemaMap.keys()).sort()
        const dataPumpHandle = 'l_dp_handle'
        const jobStatusHandleVar = 'l_status'
        const context: DataPumpContext = {
            jobMode: 'TABLE',
            jobName: this.procedureName.toUpperCase(),
            directory: 'DATA_PUMP_DIR',
            dataPumpHandle,
        }
        const scriptIndent = 4
        const indentSpaces = ' '.repeat(scriptIndent)
        return `CREATE OR REPLACE PROCEDURE ${this.procedureName.toUpperCase()}\n` +
            `AS\n` +
            `    ${dataPumpHandle} number;\n` +
            `    ${jobStatusHandleVar} varchar2(2000);\n` +
            `BEGIN\n` +
            renderOpen('EXPORT', context, scriptIndent) +
            renderAddExpFile(`${this.procedureName}.dmp`, context, scriptIndent) +
            renderAddLogFile(`${this.procedureName}.log`, context, scriptIndent) +
            schemaFilter(schemas, context, scriptIndent) +
            tableFilter(
                Array.from(this.tableNames.keys())
                    .sort(),
                context,
                scriptIndent,
            ) +
            // Adds the table data filters
            `${
                schemas.map((s) => {
                    const tableExpsMap = this.schemaMap.get(s)!
                    return Array.from(tableExpsMap.keys())
                        .sort()
                        .map((jobName) => {
                            const tableExp = tableExpsMap.get(jobName)!
                            return renderTableFilters(tableExp, context, scriptIndent)
                        }).join('')
                }).join('')
            }` +
            `${indentSpaces}dbms_datapump.start_job(handle => ${dataPumpHandle});\n` +
            `${indentSpaces}dbms_datapump.wait_for_job( handle => ${dataPumpHandle}, job_state => ${jobStatusHandleVar} );\n` +
            `${indentSpaces}dbms_datapump.detach(handle => ${dataPumpHandle});\n` +
            `EXCEPTION WHEN others THEN\n` +
            `${indentSpaces}dbms_datapump.detach(handle => ${dataPumpHandle});\n` +
            `${indentSpaces}raise;\n` +
            `END;\n`
    }

}



