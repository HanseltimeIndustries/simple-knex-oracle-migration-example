import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE kungfu_disciple
        ( id number(10) NOT NULL,
          name varchar2(50) NOT NULL,
          specialty varchar2(50),
          fear varchar2(50),
          CONSTRAINT kungfu_disciple_pk PRIMARY key (id)
        )
        `)
    await knex.raw(`
      CREATE UNIQUE INDEX UNIQUE_NAME_AND_SPECIALTY
      ON kungfu_disciple (name, specialty)
      `)
      console.log('damn')
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DELETE TABLE kungfu_disciple`)
}

