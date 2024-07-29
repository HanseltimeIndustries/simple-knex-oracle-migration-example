--- Sets up an export procedure that will dump specific table critetia to a data pump directory
--- So that local dbs can pull from it via the data_pump api
CREATE OR REPLACE PROCEDURE LOCAL_DEV_SEED_EXPORT
AS
    l_dp_handle number;
    l_status varchar2(2000);
BEGIN
    l_dp_handle := dbms_datapump.open(
        operation => 'EXPORT',
        job_mode => 'TABLE',
        remote_link => NULL,
        job_name => 'LOCAL_DEV_SEED_EXPORT',
        version => 'LATEST'
    );
    dbms_datapump.add_file(
        handle => l_dp_handle,
        filename => 'LOCAL_DEV_SEED_EXPORT.dmp',
        directory => 'DATA_PUMP_DIR'
    );
    dbms_datapump.add_file(
        handle => l_dp_handle,
        filename => 'LOCAL_DEV_SEED_EXPORT.log',
        directory => 'DATA_PUMP_DIR',
        filetype => dbms_datapump.ku$_file_type_log_file
    );
    dbms_datapump.metadata_filter(
        handle => l_dp_handle,
        name => 'SCHEMA_LIST',
        value => q'['SYSTEM']'
    );
    dbms_datapump.metadata_filter(
        handle => l_dp_handle,
        name => 'NAME_LIST',
        object_path => 'TABLE',
        value => q'['KUNGFU_DISCIPLE']'
    );
    dbms_datapump.data_filter(
        handle => l_dp_handle,
        name => 'SUBQUERY',
        schema_name => 'SYSTEM',
        table_name => 'KUNGFU_DISCIPLE',
        value => q'[WHERE id > 3]'
    );
    dbms_datapump.start_job(handle => l_dp_handle);
    dbms_datapump.wait_for_job( handle => l_dp_handle, job_state => l_status );
    dbms_datapump.detach(handle => l_dp_handle);
EXCEPTION WHEN others THEN
    dbms_datapump.detach(handle => l_dp_handle);
    raise;
END;
