import { renderAddLogFile } from "./renderAddLogFile"


const testFileName = 'somefileforlog.log'
const testDataPumpHandle = 'my_dp_var'
const testDirectory = 'TEST_PUMP_DIR'

const expectedStatement = `dbms_datapump.add_file(
    handle => ${testDataPumpHandle},
    filename => '${testFileName}',
    directory => '${testDirectory}',
    filetype => dbms_datapump.ku$_file_type_log_file
);
`
const expectedStatementIndent = `    dbms_datapump.add_file(
        handle => ${testDataPumpHandle},
        filename => '${testFileName}',
        directory => '${testDirectory}',
        filetype => dbms_datapump.ku$_file_type_log_file
    );
`

describe('schemaFilter', () => {
    it('accepts filters for multiple schemas', () => {
        expect(renderAddLogFile(testFileName, {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 0)).toEqual(expectedStatement)
    })
    it('accepts filters for multiple schemas', () => {
        expect(renderAddLogFile(testFileName, {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 4)).toEqual(expectedStatementIndent)
    })
    it('requires .dmp file name', () => {
        expect(() => renderAddLogFile('something.txt', {
            dataPumpHandle: testDataPumpHandle,
            jobMode: 'FULL',
            jobName: 'someJob',
            directory: testDirectory
        }, 0)).toThrow('must end with .log')
    })
})