import { renderTableFilters } from "./renderTableFilters"

const testTable = 'someTestTable'
const testSchemaName = 'someSchema'
const testDataPumpHandle = 'data_pump_handle'
const testSample = 678

const expectedWhereFilter = `dbms_datapump.data_filter(
    handle => ${testDataPumpHandle},
    name => \'SUBQUERY\',
    schema_name => '${testSchemaName.toUpperCase()}',
    table_name => '${testTable.toUpperCase()}',
    value => q'[WHERE something LIKE '%schwifty%']'
);
`
const expectedSampleFilter = `dbms_datapump.data_filter(
    handle => ${testDataPumpHandle},
    name => \'SAMPLE\',
    schema_name => '${testSchemaName.toUpperCase()}',
    table_name => '${testTable.toUpperCase()}',
    value => ${678}
);
`
const expectedWhereFilterIndent = `    dbms_datapump.data_filter(
        handle => ${testDataPumpHandle},
        name => \'SUBQUERY\',
        schema_name => '${testSchemaName.toUpperCase()}',
        table_name => '${testTable.toUpperCase()}',
        value => q'[WHERE something LIKE '%schwifty%']'
    );
`
const expectedSampleFilterIndent = `    dbms_datapump.data_filter(
        handle => ${testDataPumpHandle},
        name => \'SAMPLE\',
        schema_name => '${testSchemaName.toUpperCase()}',
        table_name => '${testTable.toUpperCase()}',
        value => ${678}
    );
`

describe('renderTableFilters', () => {
    it('renders for a table with where', () => {
        expect(renderTableFilters({
            table: testTable,
            schema: testSchemaName,
            where: 'something LIKE \'%schwifty%\'',
        }, {
            dataPumpHandle: testDataPumpHandle,
        } as any, 0)).toEqual(expectedWhereFilter)
    })
    it('renders for a table with sample', () => {
        expect(renderTableFilters({
            table: testTable,
            schema: testSchemaName,
            sample: testSample,
        }, {
            dataPumpHandle: testDataPumpHandle,
        } as any, 0)).toEqual(expectedSampleFilter)
    })
    it('renders for a table with sample and where', () => {
        expect(renderTableFilters({
            table: testTable,
            schema: testSchemaName,
            sample: testSample,
            where: 'something LIKE \'%schwifty%\'',
        }, {
            dataPumpHandle: testDataPumpHandle,
        } as any, 0)).toEqual(expectedWhereFilter + expectedSampleFilter)
    })
    it('renders for a table with sample and where - indented', () => {
        expect(renderTableFilters({
            table: testTable,
            schema: testSchemaName,
            sample: testSample,
            where: 'something LIKE \'%schwifty%\'',
        }, {
            dataPumpHandle: testDataPumpHandle,
        } as any, 4)).toEqual(expectedWhereFilterIndent + expectedSampleFilterIndent)
    })
})