import { renderAddExpFile } from "./renderAddExpFile"


const testFileName = 'somefileforexp.dmp'
const testDataPumpHandle = 'my_dp_var'
const testDirectory = 'TEST_PUMP_DIR'

const expectedStatement = `dbms_datapump.add_file(
    handle => ${testDataPumpHandle},
    filename => '${testFileName}',
    directory => '${testDirectory}'
);
`
const expectedStatementIndent = `    dbms_datapump.add_file(
        handle => ${testDataPumpHandle},
        filename => '${testFileName}',
        directory => '${testDirectory}'
    );
`

describe('schemaFilter', () => {
    it('accepts filters for multiple schemas', () => {
        expect(renderAddExpFile(testFileName, {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 0)).toEqual(expectedStatement)
    })
    it('accepts filters for multiple schemas', () => {
        expect(renderAddExpFile(testFileName, {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 4)).toEqual(expectedStatementIndent)
    })
    it('requires .dmp file name', () => {
        expect(() => renderAddExpFile('something.txt', {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 0)).toThrow('must end with .dmp')
    })
})