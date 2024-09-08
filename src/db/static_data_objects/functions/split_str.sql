CREATE OR REPLACE FUNCTION split_str(comma_delimited IN VARCHAR2)
  RETURN STR_ARRAY
AS
  l_result STR_ARRAY := STR_ARRAY();
BEGIN
  FOR CURRENT_ROW IN (
    with test as    
      (select comma_delimited from dual)
      select regexp_substr(comma_delimited, '[^,]+', 1, rownum) SPLIT
      from test
      connect by level <= length (regexp_replace(comma_delimited, '[^,]+'))  + 1)
  LOOP
    l_result.EXTEND;
    l_result(l_result.COUNT) := CURRENT_ROW.SPLIT;
  END LOOP;

  RETURN l_result;
END split_str;
