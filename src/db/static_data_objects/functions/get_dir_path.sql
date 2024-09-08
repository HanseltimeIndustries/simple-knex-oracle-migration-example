CREATE OR REPLACE FUNCTION get_dir_path(dir_name IN VARCHAR2)
  RETURN VARCHAR2
  AUTHID CURRENT_USER
AS
  l_path    VARCHAR2(32767);
BEGIN
  -- Get the actual path of the directory for querying --
  BEGIN
      select DIRECTORY_PATH into l_path 
        from (SELECT DIRECTORY_PATH
                FROM ALL_DIRECTORIES
                WHERE DIRECTORY_NAME = dir_name)
       where rownum < 2 
             ;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    sys.DBMS_OUTPUT.PUT_LINE('Could not find a directory named ' || dir_name);
    raise;
  END;

  RETURN l_path;
END;
