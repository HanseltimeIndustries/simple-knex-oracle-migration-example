import { escapedString } from "./escapedString"
import { DataPumpContext, TableDataExport } from "./types"



/**
 * Creates a set of data pump filters for a table.  Supposed to be used in conjunction with
 * TableDataExportBuilder
 * 
 * @param tableDataExp 
 * @param context 
 * @returns 
 */
export function renderTableFilters(tableDataExp: TableDataExport, context: DataPumpContext, spaceIndent: number) {
    const indent = ' '.repeat(spaceIndent)
    const { dataPumpHandle } = context
    const schemaName = tableDataExp.schema.toUpperCase()
    const tableName = tableDataExp.table.toUpperCase()
    let filters = ''
    if ((tableDataExp as { where: string }).where) {
        filters += `${indent}dbms_datapump.data_filter(\n` +
            `${indent}    handle => ${dataPumpHandle},\n` +
            `${indent}    name => 'SUBQUERY',\n` +
            `${indent}    schema_name => '${schemaName}',\n` +
            `${indent}    table_name => '${tableName}',\n` + 
            `${indent}    value => ${escapedString(`WHERE ${(tableDataExp as { where: string }).where}`)}\n` +
        `${indent});\n`
    }
    if ((tableDataExp as { sample: number }).sample) {
        filters += `${indent}dbms_datapump.data_filter(\n` +
            `${indent}    handle => ${dataPumpHandle},\n` +
            `${indent}    name => 'SAMPLE',\n` +
            `${indent}    schema_name => '${schemaName}',\n` +
            `${indent}    table_name => '${tableName}',\n` +
            `${indent}    value => ${(tableDataExp as { sample: number }).sample}\n` +
            `${indent});\n`
    }
    return filters
}



