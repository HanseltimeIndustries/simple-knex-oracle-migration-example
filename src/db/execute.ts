import { isAbsolute, join } from 'path'
import Knex, { Knex as KnexType } from 'knex'
import { executeSql } from './utils/execute'
import { readFileSync } from 'fs'

export interface ExecuteOptions {
    env: string
    sqlFile: string
    knexfile?: string
    binds: {
        [varName: string]: number |string
    }
}

/**
 * Given our need to run sequential migrations AND 
 * lastest value object updates (like STORED_PROCEDURES), we
 * use this script to programmatically call both the
 * knex migration APIs and then apply additional updates
 * for those latest value objects.
 */
export async function execute(options: ExecuteOptions) {
    let knex: KnexType | undefined
    try {
        const file = options.knexfile || 'knexfile.js'
        const configPath = isAbsolute(file) ? file : join(process.cwd(), file)
        const config = (await import(configPath.replace('.ts', '')) as any).default
        const envConfig = config[options.env]
        knex = Knex(envConfig)

        const scriptPath = isAbsolute(options.sqlFile) ? options.sqlFile : join(__dirname, 'scripts', options.sqlFile)
        const sql = readFileSync(scriptPath).toString()
        console.log(`Executing ${scriptPath}...\n`)
        const { consoleOut } = await executeSql(knex, sql, {
            input: options.binds,
        })
        console.log(consoleOut)
    } finally {
        await knex?.destroy()
    }
}

