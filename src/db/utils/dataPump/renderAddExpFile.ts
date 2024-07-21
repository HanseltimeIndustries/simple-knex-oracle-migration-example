import { escapedString } from "./escapedString"
import { DataPumpContext } from "./types"

/**
 * Renders the line for adding a datapump file
 * @param fileName 
 * @param context 
 * @param spaceIndent 
 * @returns 
 */
export function renderAddExpFile(fileName: string, context: DataPumpContext, spaceIndent: number) {
    if (!fileName.endsWith('.dmp')) {
        throw new Error(`Dump file name ${fileName} must end with .dmp`)
    }
    const indent = ' '.repeat(spaceIndent)
    return `${indent}dbms_datapump.add_file(\n` +
        `${indent}    handle => ${context.dataPumpHandle},\n` +
        `${indent}    filename => '${fileName}',\n` +
        `${indent}    directory => '${context.directory}'\n` +
        `${indent});\n`
}
