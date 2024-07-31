import type { Knex } from "knex";

/**
 * This is an example of running a time-sensitive seed-like operation.
 * 
 * This is different from seeding because we need it to happen to influence
 * other migrations in time.
 * @param knex 
 */
export async function up(knex: Knex): Promise<void> {
    console.log('runing seed migration')
    await knex.insert([
        {
            ID: 1,
            NAME: 'billy',
            SPECIALTY: 'air-bending',
            FEAR: 'spiders',
        },
        {
            ID: 2,
            NAME: 'billy2',
            SPECIALTY: 'water-bending',
            FEAR: 'spiders',
        },
        {
            ID: 3,
            NAME: 'tom',
            SPECIALTY: 'some-bending',
            FEAR: 'guns',
        },
        {
            ID: 4,
            NAME: 'sally',
            SPECIALTY: 'fire-bending',
            FEAR: 'cthulu',
        },
        {
            ID: 5,
            NAME: 'nicvk',
            SPECIALTY: 'air-bending',
            FEAR: 'chuck norris',
        },
        {
            ID: 6,
            NAME: 'luke',
            SPECIALTY: 'the-force',
            FEAR: 'star trek',
        },
    ]).into('KUNGFU_DISCIPLE')
}


export async function down(knex: Knex): Promise<void> {
}

