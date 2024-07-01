/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.raw(`
    CREATE TABLE kungfu_disciple
    ( id number(10) NOT NULL,
      name varchar2(50) NOT NULL,
      specialty varchar2(50),
      fear varchar2(50),
      CONSTRAINT kungfu_disciple_pk PRIMARY key (id)
    )
    `)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw(`DELETE TABLE kungfu_disciple`)
};
