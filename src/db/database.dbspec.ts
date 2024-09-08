import Knex, { Knex as KnexType} from 'knex'
import { join } from 'path'
import config, { Envs } from './knexfile'
import { fullMigration } from './fullMigration'

let client: KnexType
/**
 * Ensures that we at least run integration tests
 * 
 * IMPORTANT - you may need to push the timelimit for migrations as they grow
 */
beforeAll(async () => {

    const envConfig = config[Envs.TestDb]
    client = Knex(envConfig)

    const migrationTable = envConfig.migrations?.tableName ?? 'knex_migrations'
    // check if there is a migrations table
    const table = await client.raw(`
        SELECT table_name FROM user_tables
        WHERE table_name = '${migrationTable}'
    `)

    if (table.length > 0) {
        // Ensure that this database is not already half-migrated
        const existingMigrations = await client.raw(`
            SELECT COUNT(*) as cnt FROM "${migrationTable}"
            `)
        const count = existingMigrations[0].CNT
        if (count > 0) {
            throw new Error(`Attempting to perform database migration snapshots on a non-clean database.  Please start with a fresh DB.`)
        }
    }


    // Run all migrations
    await fullMigration({
        env: Envs.TestDb,
        knexfile: join(__dirname, 'knexfile.ts')
    })
}, 10000)

afterAll(async () => {
    await client?.destroy()
})

it('ran migrations successfully', () => {
    // Note: this just ensures we have passed the migrate phase in before each
    return;
})

it('runs local seeds sucessfully', async () => {
    await client.seed.run()
})

it.skip.each([
    // TODO: any sources that we want to control
])('matches snapshots for the db %s', async (dataObject) => {
    const sources = await client<any>('ALL_SOURCE')
        .select('TEXT')
        .where({
            TYPE: dataObject,
            OWNER: 'SYSTEM'
        })

    const procedures = parseTextFiles(sources, dataObject)
    
    procedures.forEach((procedure) => {
        expect(procedure.source).toMatchSnapshot(procedure.name)
    })
})

// TODO: setup up a filter to avoid system sequences if you want
// it.skip('matches snapshots for sequeunces %s', async () => {
//     const sources = await client<any>('ALL_SEQUENCES')
//     .select('TEXT')
//     .where({
//         TYPE: 'INDEX',
//         OWNER: 'SYSTEM'
//     })

//     const procedures = parseTextFiles(sources, 'INDEX')

//     procedures.forEach((procedure) => {
//         expect(procedure.source).toMatchSnapshot(procedure.name)
//     })
// })

function parseTextFiles(sourceLines: {
    TEXT: string
}[], dataObject: string) {
    let idx = -1
    return sourceLines.reduce((sources, sourceLine) => {
        const textPiece = sourceLine.TEXT
        if (textPiece.startsWith(`${dataObject} `)) {
            idx++
            const match = new RegExp(`${dataObject}\\s+[^\\s]+`).exec(textPiece)
            sources.push({
                name: match![0],
                source: textPiece
            })
        } else {
            sources[idx].source += textPiece
        }
        return sources
    }, [] as {
        name: string
        source: string
    }[])
}