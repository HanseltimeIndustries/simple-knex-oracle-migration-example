import { DataPumpContext } from "./types"

/**
 * Renders a full datapump.open line, including assigning it to the dataPumpHandle
 * variable name provided.
 * @param type 
 * @param context 
 * @param spaceIndent 
 * @returns 
 */
export function renderOpen(type: 'EXPORT' | 'IMPORT', context: DataPumpContext, spaceIndent: number) {
    const indent = ' '.repeat(spaceIndent)
    return `${indent}${context.dataPumpHandle} := dbms_datapump.open(\n` +
        `${indent}    operation => '${type}',\n` +
        `${indent}    job_mode => '${context.jobMode}',\n` +
        `${indent}    remote_link => NULL,\n` +
        `${indent}    job_name => '${context.jobName}',\n` +
        `${indent}    version => 'LATEST'\n` +
        `${indent});\n`
}