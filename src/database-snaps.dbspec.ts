import Knex, { Knex as KnexType} from 'knex'
import { join } from 'path'

let client: KnexType

beforeAll(async () => {
    const config = await import(join(__dirname, '..', 'knexfile.js'))

    const envConfig = config['dbTest']
    client = Knex(envConfig)

    const migrationTable = envConfig.tableName ?? 'knex_migrations'
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
    await client.migrate.latest()
})

afterAll(async () => {
    await client?.destroy()
})

it('matches snapshots for the db stored_procedures', async () => {
    const sources = await client<any>('ALL_SOURCE')
        .select('TEXT')
        .where({
            TYPE: 'PROCEDURE',
            OWNER: 'SYSTEM'
        })

    const procedures = parseTextFiles(sources)
    
    procedures.forEach((procedure) => {
        expect(procedure.source).toMatchSnapshot(procedure.name)
    })
})

function parseTextFiles(sourceLines: {
    TEXT: string
}[]) {
    let idx = -1
    return sourceLines.reduce((sources, sourceLine) => {
        const textPiece = sourceLine.TEXT
        if (textPiece.startsWith('PROCEDURE ')) {
            idx++
            const match = /PROCEDURE\s+[^\s]+/.exec(textPiece)
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