import { schemaFilter } from "./schemaFilter"

const testSchema1 = 'schema_a'
const testSchema2 = 'schema_b'
const testDataPumpHandle = 'my_dp_var'

const expectedFilter = `dbms_datapump.metadata_filter(
    handle => ${testDataPumpHandle},
    name => \'SCHEMA_LIST\',
    value => q'['${testSchema1.toUpperCase()}','${testSchema2.toUpperCase()}']'
);
`
const expectedFilterIndent = `    dbms_datapump.metadata_filter(
        handle => ${testDataPumpHandle},
        name => \'SCHEMA_LIST\',
        value => q'['${testSchema1.toUpperCase()}','${testSchema2.toUpperCase()}']'
    );
`

describe('schemaFilter', () => {
    it('accepts filters for multiple schemas', () => {
        expect(schemaFilter([testSchema1, testSchema2], {
            dataPumpHandle: testDataPumpHandle
        } as any, 0)).toEqual(expectedFilter)
    })
    it('accepts filters for multiple schemas - indented', () => {
        expect(schemaFilter([testSchema1, testSchema2], {
            dataPumpHandle: testDataPumpHandle
        } as any, 4)).toEqual(expectedFilterIndent)
    })
})