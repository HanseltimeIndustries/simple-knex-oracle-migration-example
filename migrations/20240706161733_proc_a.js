exports.up = async (knex) => {
    await knex.raw(`
    CREATE PROCEDURE SelectAllDiscisples
    AS
    BEGIN
    SELECT * FROM kungfu_disciple;
    END
`)
}


exports.down = async (knex) => {
}
