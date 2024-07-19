import type { Knex } from "knex";
import { CompiledTypes, ensureNoCompileErrors } from "../utils";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE PROCEDURE SelectAllDisciples
        AS
            TYPE disc_tab IS TABLE OF kungfu_disciple%ROWTYPE INDEX BY PLS_INTEGER;
            all_disciples disc_tab;
        BEGIN
        SELECT * BULK COLLECT INTO all_disciples FROM kungfu_disciple;
        END;
    `)
    await ensureNoCompileErrors(knex, CompiledTypes.Procedure, 'SelectAllDisciples')
}


export async function down(knex: Knex): Promise<void> {
    // Rolling back procedures is pretty much a no-go
}

