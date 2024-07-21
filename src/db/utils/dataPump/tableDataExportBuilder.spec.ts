import { TableDataExportBuilder } from "./tableDataExportBuilder"

const expectedProcedure = `CREATE OR REPLACE PROCEDURE MY_TEST_EXPORT
AS
    l_dp_handle number;
    l_status varchar2(2000);
BEGIN
    l_dp_handle := dbms_datapump.open(
        operation => 'EXPORT',
        job_mode => 'TABLE',
        remote_link => NULL,
        job_name => 'MY_TEST_EXPORT',
        version => 'LATEST'
    );
    dbms_datapump.add_file(
        handle => l_dp_handle,
        filename => 'my_test_export.dmp',
        directory => 'DATA_PUMP_DIR'
    );
    dbms_datapump.add_file(
        handle => l_dp_handle,
        filename => 'my_test_export.log',
        directory => 'DATA_PUMP_DIR',
        filetype => dbms_datapump.ku$_file_type_log_file
    );
    dbms_datapump.metadata_filter(
        handle => l_dp_handle,
        name => 'SCHEMA_LIST',
        value => q'['SCHEMA_A','SCHEMA_B']'
    );
    dbms_datapump.metadata_filter(
        handle => l_dp_handle,
        name => 'NAME_LIST',
        object_path => 'TABLE',
        value => q'['MY_THING','TABLE1','TABLE22']'
    );
    dbms_datapump.data_filter(
        handle => l_dp_handle,
        name => 'SUBQUERY',
        schema_name => 'SCHEMA_A',
        table_name => 'TABLE1',
        value => q'[WHERE something = 44]'
    );
    dbms_datapump.data_filter(
        handle => l_dp_handle,
        name => 'SAMPLE',
        schema_name => 'SCHEMA_A',
        table_name => 'TABLE22',
        value => 777
    );
    dbms_datapump.data_filter(
        handle => l_dp_handle,
        name => 'SUBQUERY',
        schema_name => 'SCHEMA_B',
        table_name => 'MY_THING',
        value => q'[WHERE foo = 'bar']'
    );
    dbms_datapump.start_job(handle => l_dp_handle);
    dbms_datapump.wait_for_job( handle => l_dp_handle, job_state => l_status );
    dbms_datapump.detach(handle => l_dp_handle);
EXCEPTION WHEN others THEN
    dbms_datapump.detach(handle => l_dp_handle);
    raise;
END;
`

describe('TableDataExportBuilder', () => {
    it('creates a query for export - basic int check', () => {
        expect(new TableDataExportBuilder('my_test_export')
            .addTable({
                table: 'table1',
                schema: 'schema_a',
                where: 'something = 44'
            })
            .addTable({
                table: 'table22',
                schema: 'schema_a',
                sample: 777,
            })
            .addTable({
                table: 'my_thing',
                schema: 'schema_b',
                where: 'foo = \'bar\''
            })
            .build()).toEqual(expectedProcedure)

    })
})