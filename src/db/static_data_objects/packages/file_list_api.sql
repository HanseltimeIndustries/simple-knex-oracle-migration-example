CREATE OR REPLACE PACKAGE file_list_api AS

FUNCTION list (p_path IN VARCHAR2) RETURN VARCHAR2
AS LANGUAGE JAVA 
NAME 'FileListHandler.list (java.lang.String) return java.lang.String';

END file_list_api;