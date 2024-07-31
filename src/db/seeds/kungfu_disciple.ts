import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Optional - Deletes ALL existing entries, if there are no critical data seeds in migration
    // await knex("table_name").del();
    await knex.insert([
        {
            ID: 9,
            NAME: 'aang',
            SPECIALTY: 'rule-bending',
            FEAR: 'justice',
        },
        {
            ID: 10,
            NAME: 'katara',
            SPECIALTY: 'light-bending',
            FEAR: 'curtains',
        },
    ]).into('KUNGFU_DISCIPLE')
};
