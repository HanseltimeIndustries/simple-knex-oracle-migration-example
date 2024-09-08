CREATE OR REPLACE FUNCTION list_directory_files(dir_name IN VARCHAR2,
                                            sub_path IN VARCHAR2 := '',
                                            p_file_separator IN VARCHAR2 := '/')
  RETURN STR_ARRAY PIPELINED
  AUTHID CURRENT_USER
AS
  l_ns      VARCHAR2(32767);
  l_path    VARCHAR2(32767);
BEGIN
  l_path := get_dir_path(dir_name);

  IF sub_path IS NOT NULL THEN
    IF l_path LIKE '%' || p_file_separator THEN
      l_path := l_path || sub_path;
    ELSE
      -- Prepend the slash if not present
      l_path := l_path || p_file_separator || sub_path;
    END IF;
  END IF;

  -- Pull back all files directly under specified directory.
  -- WHERE filter removes recursion.
  FOR cur_rec IN (SELECT * FROM TABLE(SPLIT_STR(FILE_LIST_API.list(l_path))))
  LOOP
    -- Display the file name without the preceding path.
    PIPE ROW(cur_rec.COLUMN_VALUE);
  END LOOP;
  RETURN;
END;
