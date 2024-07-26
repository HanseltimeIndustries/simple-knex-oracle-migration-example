import { program } from 'commander'
import { fullMigration } from '../fullMigration'

program
    .requiredOption('--env <env>', 'The env identifier in the config file to use for connections')
    .option('--knexfile <filePath>', 'The location of a knex file')
    .option('-v, --verbose')
    .parse()

const {
    env,
    knexfile,
    verbose,
} = program.opts<{
    env: string
    knexfile?: string
    verbose?: boolean
}>()

void fullMigration({
    env,
    knexfile,
    verbose
}).then(() => {
    process.exit()
})
