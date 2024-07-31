import Knex, { Knex as KnexType } from "knex"

interface CopyOverProps {
    localDbConfig: KnexType.Config
    devSourceDbConfig: KnexType.Config
}

export class CopyOver {
    copyFrom: KnexType
    copyTo: KnexType
    constructor(props: CopyOverProps) {
        this.copyFrom = Knex(props.devSourceDbConfig)
        this.copyTo = Knex(props.localDbConfig)
    }

    async copy(options: {
        schema: string
        table: string
        where?: string
        orderBy?: string
        limit?: number
    }) {
        let query = this.copyFrom.withSchema(options.schema).table(options.table)

        if (options.where) {
            query = query.whereRaw(options.where)
        }
        if (options.orderBy) {
            query = query.orderByRaw(options.orderBy)
        }
        if (options.limit) {
            query = query.limit(options.limit)
        }

        const rows = await query

        await this.copyTo.withSchema(options.schema).table(options.table)
            .insert(rows)
    }

    async copyInBatches(options: {
        schema: string
        table: string
        where?: string
        limit?: number
    }, batchOptions: {
        uniqueColumn: string
        batchSize: number
    }) {
        let numRows = 0
        let finished: boolean = false
        const limit = options.limit ?? Number.MAX_SAFE_INTEGER
        let batchSize = batchOptions.batchSize
        let lastUniqueRow: string | number = ''
        while (!finished) {
            let query = this.copyFrom.withSchema(options.schema).table(options.table)

            const cursorClause = lastUniqueRow ? `${options.where ? 'AND' : ''} ${batchOptions.uniqueColumn} > ${isNaN(lastUniqueRow as any) ? `'${lastUniqueRow}` : lastUniqueRow}` : ''
            const whereClause = `${options.where ?? ''} ${cursorClause}`
            if (whereClause.trim()) {
                query = query.whereRaw(whereClause)
            }
            query = query.orderByRaw(`${batchOptions.uniqueColumn} ASC`)
            query = query.limit(batchSize)

            const rows = await query
            if (rows.length === 0) {
                break
            }

            await this.copyTo.withSchema(options.schema).table(options.table)
                .insert(rows)

            numRows += rows.length
            
            if (limit - numRows < batchSize) {
                batchSize = limit - numRows
            }

            if (rows.length === 0 || numRows >= limit) {
                finished = true
            } else {
                lastUniqueRow = rows[rows.length - 1][batchOptions.uniqueColumn]
            }
        }
    }
}