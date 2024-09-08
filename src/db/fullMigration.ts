import { isAbsolute, join } from 'path'
import Knex, { Knex as KnexType } from 'knex'
import { deploy as deployStoreProcedures } from './static_data_objects/deploy'
import { Envs } from './knexfile'

export interface FullMigrationOptions {
    env: string
    knexfile?: string
    verbose?: boolean
}

/**
 * Given our need to run sequential migrations AND 
 * lastest value object updates (like STORED_PROCEDURES), we
 * use this script to programmatically call both the
 * knex migration APIs and then apply additional updates
 * for those latest value objects.
 */
export async function fullMigration(options: FullMigrationOptions) {
    let knex: KnexType | undefined
    try {
        const file = options.knexfile || 'knexfile.js'
        const configPath = isAbsolute(file) ? file : join(process.cwd(), file)
        const config = (await import(configPath.replace('.ts', '')) as any).default
        const envConfig = config[options.env]
        knex = Knex(envConfig)

        // Run all migrations - todo parameterize for partial
        console.log('Migrating time sequenced files...')
        const [_completed, pending] = await knex.migrate.list() as [number, number]
        await knex.migrate.latest()
        console.log(`Migrated ${pending} files`)
        console.log('Updating Stored Procedures...')
        await deployStoreProcedures(knex, {
            verbose: options.verbose,
            env: options.env as Envs,
        })
        console.log('Updated Store Procedures')
    } finally {
        await knex?.destroy()
    }
}

