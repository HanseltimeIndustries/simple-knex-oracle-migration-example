import { renderOpen } from "./renderOpen"
import { schemaFilter } from "./schemaFilter"
import { DataPumpContext } from "./types"

const testJobName = 'My_cool_job'
const testDataPumpHandle = 'my_dp_var'

const expectedOpenTemplate = `${testDataPumpHandle} := dbms_datapump.open(
    operation => '\${OP}',
    job_mode => '\${JOB_MODE}',
    remote_link => NULL,
    job_name => '${testJobName}',
    version => 'LATEST'
);
`
const expectedOpenIndentTemplate = `    ${testDataPumpHandle} := dbms_datapump.open(
        operation => '\${OP}',
        job_mode => '\${JOB_MODE}',
        remote_link => NULL,
        job_name => '${testJobName}',
        version => 'LATEST'
    );
`

const testModes: DataPumpContext['jobMode'][] = ['FULL', 'SCHEMA', 'TABLE', 'TABLESPACE', 'TRANSPORTABLE']

describe('schemaFilter', () => {

    it.each(
        // All job modes for each operation type
        ['IMPORT', 'EXPORT'].reduce((cases, op) => {
            cases.push(...testModes.map((mode) => [op, mode] as ['IMPORT' | 'EXPORT', DataPumpContext['jobMode']]))
            return cases
        }, [] as ['IMPORT' | 'EXPORT', DataPumpContext['jobMode']][])
    )('creates open operatrion %s for mode %s', (op, mode) => {
        expect(renderOpen(op, {
            dataPumpHandle: testDataPumpHandle,
            directory: 'some_dir',
            jobMode: mode,
            jobName: testJobName,
        }, 0)).toEqual(
            expectedOpenTemplate
                .replace('${OP}', op)
                .replace('${JOB_MODE}', mode)
        )
    })
    it.each(
        // All job modes for each operation type
        ['IMPORT', 'EXPORT'].reduce((cases, op) => {
            cases.push(...testModes.map((mode) => [op, mode] as ['IMPORT' | 'EXPORT', DataPumpContext['jobMode']]))
            return cases
        }, [] as ['IMPORT' | 'EXPORT', DataPumpContext['jobMode']][])
    )('creates open operatrion %s for mode %s - indent', (op, mode) => {
        expect(renderOpen(op, {
            dataPumpHandle: testDataPumpHandle,
            directory: 'some_dir',
            jobMode: mode,
            jobName: testJobName,
        }, 4)).toEqual(
            expectedOpenIndentTemplate
                .replace('${OP}', op)
                .replace('${JOB_MODE}', mode)
        )
    })
})