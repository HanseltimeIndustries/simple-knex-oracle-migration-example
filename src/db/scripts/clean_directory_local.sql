-- Deletes all files in a directory on your local database
--   This depends on all migrations for local to be up to date since it uses list_directory_files()
-- Params
--   dir_name - the name of the directory
DECLARE
    l_fexists BOOLEAN;
    l_file_length NUMBER;
    l_block_size BINARY_INTEGER;
BEGIN
  FOR cur_rec IN (SELECT * FROM TABLE(list_directory_files(:dir_name)))
  LOOP
    utl_file.fgetattr(
        location => :dir_name,
        filename => cur_rec.COLUMN_VALUE,
        fexists => l_fexists,
        file_length => l_file_length,
        block_size => l_block_size);
    if l_fexists then
        -- this is the only way to detect directories without MORE custom java
        DBMS_OUTPUT.PUT_LINE('DELETING ' || cur_rec.COLUMN_VALUE || '...');
        UTL_FILE.FREMOVE (:dir_name, cur_rec.COLUMN_VALUE);
    end if;
  END LOOP;
END;
