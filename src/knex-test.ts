import { knex } from 'knex'

/**
 * Just a silly example of connecting knex and running raw sql queries
 */
async function main() {
    const client = knex({
        client: 'oracledb',
        connection: {
            host: '127.0.0.1',
            port: 8888,
            user: 'SYSTEM',
            password: 'testPword',
            database: 'FREEPDB1',
        },
    }) 
    const numRows = await client.raw('SELECT COUNT(*) FROM kungfu_disciple')
    console.log(numRows)
}

void main()