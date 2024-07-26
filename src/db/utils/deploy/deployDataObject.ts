import { readFileSync } from "fs"
import { Knex as KnexType } from "knex"
import { CompiledTypes, ensureNoCompileErrors } from "../ensureNoCompileErrors"
import { parseDataObjectSql } from "../parseDataObjectSql"

/*
 * Use then when deploying anything that could compile with errors from a file. 
 */
export async function deployDataObject(knex: KnexType, sqlFilePath: string) {
    const sql = readFileSync(sqlFilePath).toString()
    // oracle-db adapter does not have informative errors, wrap and rethrow
    try {
        await knex.raw(sql)
    } catch (err) {
        throw new Error((err as { message: string}).message ?? err)
    }

    const { dataType, name} = parseDataObjectSql(sql)
    ensureNoCompileErrors(knex, dataType as CompiledTypes, name)
}