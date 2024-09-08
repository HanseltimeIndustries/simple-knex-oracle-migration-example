-- Deletes all files in a directory on an rds database
--   The user must have rdsadmin permissions
-- Params
--   dir_name - the name of the directory
DECLARE
BEGIN
  FOR cur_rec IN (SELECT * FROM TABLE(rdsadmin.rds_file_util.listdir(p_directory => :dir_name)) WHERE TYPE <> 'directory')
  LOOP
    DBMS_OUTPUT.PUT_LINE('DELETING ' || cur_rec.FILENAME || '...');
    UTL_FILE.FREMOVE (:dir_name, cur_rec.FILENAME);
  END LOOP;
END;
