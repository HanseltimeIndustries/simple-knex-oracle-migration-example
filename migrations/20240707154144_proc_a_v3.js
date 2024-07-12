exports.up = async (knex) => {
    // This fundamentally changes the schema and returns of the procedure
    // This is an example of something we want to explicitly catch
    await knex.raw(`
    CREATE OR REPLACE PROCEDURE "SelectAllDiscisples"
    AS
    BEGIN
    SELECT * FROM kungfu_disciple WHERE id = 77;
    END;
`)
}


exports.down = async (knex) => {
}

