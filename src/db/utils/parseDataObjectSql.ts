import assert from "assert"

export function parseDataObjectSql(sql: string) {
    const match = /CREATE\s+(OR\s+REPLACE\s+)?([^\s]+)\s+([^\s]+)/gim.exec(sql)
    const dataType = match?.[2]
    const name = match?.[3]
    assert(!!dataType, `Could not determine the dataObject from sql:\n${sql}`)
    assert(!!name, `Could not determine name of ${dataType} from sql:\n${sql}`)

    return {
        dataType,
        name,
    }
}