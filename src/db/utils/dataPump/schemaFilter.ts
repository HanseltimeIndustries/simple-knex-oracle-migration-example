import { escapedString } from "./escapedString"
import { DataPumpContext } from "./types"

export function schemaFilter(schemas: string[], context: DataPumpContext, spaceIndent: number) {
    const indent = ' '.repeat(spaceIndent)
    return `${indent}dbms_datapump.metadata_filter(\n` +
        `${indent}    handle => ${context.dataPumpHandle},\n` +
        `${indent}    name => 'SCHEMA_LIST',\n` +
        `${indent}    value => ${
            escapedString(schemas
                .map((s) => `'${s.toUpperCase()}'`)
                .join(',')
            )
            }\n` +
    `${indent});\n`
}