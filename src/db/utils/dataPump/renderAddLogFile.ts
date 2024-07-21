import { escapedString } from "./escapedString"
import { DataPumpContext } from "./types"

/**
 * Renders the line for adding a datapump log file
 * @param fileName 
 * @param context 
 * @param spaceIndent 
 * @returns 
 */
export function renderAddLogFile(fileName: string, context: DataPumpContext, spaceIndent: number) {
    if (!fileName.endsWith('.log')) {
        throw new Error(`Log file name ${fileName} must end with .log`)
    }
    const indent = ' '.repeat(spaceIndent)
    return `${indent}dbms_datapump.add_file(\n` +
        `${indent}    handle => ${context.dataPumpHandle},\n` +
        `${indent}    filename => '${fileName}',\n` +
        `${indent}    directory => '${context.directory}',\n` +
        `${indent}    filetype => dbms_datapump.ku$_file_type_log_file\n` +
        `${indent});\n`
}
