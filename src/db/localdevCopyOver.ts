import assert from 'assert'
import { Envs } from './knexfile'
import { CopyOver } from './utils/localImport'

export interface LocalDevImportOptions {
    fromEnv: Envs
    toEnv: Envs
}

export async function localdevImport(options: LocalDevImportOptions) {

    const config = (await import('./knexfile')).default

    const devSourceDbConfig = config[options.fromEnv]
    const localDbConfig = config[options.toEnv]

    // We do this since env could be user input
    assert(devSourceDbConfig, `Could not find config for ${options.fromEnv}`)
    assert(localDbConfig, `Could not find config for ${options.toEnv}`)

    const copyOver = new CopyOver({
        localDbConfig,
        devSourceDbConfig,
    })

    // Apply Local System copy over as needed
    await copyOver.copyInBatches({
        schema: 'SYSTEM',
        table: 'KUNGFU_DISCIPLE',
        limit: 5,
        where: 'ID > 2',
    }, {
        batchSize: 2,
        uniqueColumn: 'ID',
    })

}
