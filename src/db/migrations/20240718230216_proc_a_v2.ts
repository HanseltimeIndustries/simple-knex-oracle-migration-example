import type { Knex } from "knex";
import { CompiledTypes, ensureNoCompileErrors } from "../utils";


export async function up(knex: Knex): Promise<void> {
    // This fundamentally changes the schema and returns of the procedure
    // This is an example of something we want to explicitly catch
    await knex.raw(`
        CREATE OR REPLACE PROCEDURE SelectAllDisciples
        AS
            TYPE disc_tab IS TABLE OF kungfu_disciple%ROWTYPE INDEX BY PLS_INTEGER;
            all_disciples disc_tab;
        BEGIN
        SELECT * BULK COLLECT INTO all_disciples FROM kungfu_disciple WHERE id = 44;
        END;
        `)
    await ensureNoCompileErrors(knex, CompiledTypes.Procedure, 'SelectAllDisciples')
}


export async function down(knex: Knex): Promise<void> {
    // Rolling back procedures is pretty much a no-go
}

