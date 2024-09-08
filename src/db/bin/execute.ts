import { program, InvalidArgumentError } from 'commander'
import { execute } from '../execute'

function collectN(value: string, previous: {
    [varName: string]: string | number
}) {
    const [varName, val] = value.split('=')

    const parsedValue = parseInt(val, 10);
    if (isNaN(parsedValue)) {
      throw new InvalidArgumentError(`${value} is not a number.`);
    }
    previous[varName] = parsedValue
    return previous
}

function collectS(value: string, previous: {
    [varName: string]: string | number
}) {
    const [varName, val] = value.split('=')

    previous[varName] = val
    return previous
}

program
    .requiredOption('--env <env>', 'The env identifier in the config file to use for connections')
    .option('--knexfile <filePath>', 'The location of a knex file')
    .option('--varN <varName=NN>', 'Declares a number variable of the name and value', collectN, {})
    .option('--varS <varName=string>', 'Declares a string variable of the name and value', collectS, {})
    .argument('<script path>', 'Either absolute or the .sql file in the src/db/scripts/ folder')
    .parse()

const {
    env,
    knexfile,
    varN,
    varS,
} = program.opts<{
    env: string
    knexfile?: string
    varN?: {
        [varName: string]: string | number
    }
    varS?: {
        [varName: string]: string | number
    }
}>()

const sqlFile = program.processedArgs[0]

if (!sqlFile) {
    throw new InvalidArgumentError('Must supply an sqlFile to run!')
}

void execute({
    env,
    knexfile,
    sqlFile,
    binds: {
        ...varN,
        ...varS,
    }
}).then(() => {
    process.exit()
})
