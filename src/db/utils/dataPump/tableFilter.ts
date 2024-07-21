import { escapedString } from "./escapedString"
import { DataPumpContext } from "./types"

export function tableFilter(tables: string[], context: DataPumpContext, spaceIndent: number) {
    const indent = ' '.repeat(spaceIndent)
    return `${indent}dbms_datapump.metadata_filter(\n` +
        `${indent}    handle => ${context.dataPumpHandle},\n` +
        `${indent}    name => \'NAME_LIST\',\n` +
        `${indent}    object_path => \'TABLE\',\n` +
        `${indent}    value => ${
            escapedString(tables
                .map((t) => `'${t.toUpperCase()}'`)
                .join(',')
            )
            }\n` +
    `${indent});\n`
}