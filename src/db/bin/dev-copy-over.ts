import { program } from 'commander'
import { fullMigration } from '../fullMigration'
import { localdevImport } from '../localdevCopyOver'
import { Envs } from '../knexfile'

program
    .requiredOption('--fromEnv <env>', 'The env identifier in the config file to connect to and copy from')
    .requiredOption('--toEnv <env>', 'The env identifier in the config file to connect to and copy to')
    .parse()

const {
    fromEnv,
    toEnv
} = program.opts<{
    fromEnv: Envs
    toEnv: Envs
}>()

void localdevImport({
    fromEnv,
    toEnv,
}).then(() => {
    process.exit()
})
