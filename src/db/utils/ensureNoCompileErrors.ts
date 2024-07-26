import { Knex } from "knex"

/**
 * TODO: add the compiled types that can fail with a 0 exit code when being written
 */
export enum CompiledTypes {
    Procedure = 'PROCEDURE',
    Trigger = 'TRIGGER',
    Sequence = 'SEQUENCE'
}

/**
 * This should be called when creating anything of a CompiledType since oracle does
 * not stop overwriting if there's an error detected in the type.
 * 
 * By calling this, we will throw an error if we find an error so that things like migrations
 * can fail artificially.
 * 
 * @param knex The knex client that was configured
 * @param type 
 * @param name 
 */
export async function ensureNoCompileErrors(knex: Knex, type: CompiledTypes, name: string) {
    const result = await knex.raw(`
        SELECT COUNT(*) FROM DBA_ERRORS
        WHERE
        TYPE = '${type.toUpperCase()}'
        AND NAME = '${name.toUpperCase()}'
        `)
    const cnt = result[0]['COUNT(*)']
    if (cnt != 0) {
        throw new Error(`There were errors creating ${type} named ${name}.  Please verify the errors by checking` + 
            `\`SELECT * FROM DBA_ERRORS WHERE TYPE = '${type}' AND NAME = '${name}'\` or \`SHOW ERROS ${type} ${name} in sqlplus\``
        )
    }
}