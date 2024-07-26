CREATE OR REPLACE PROCEDURE INSERT_TEST_DISCIPLE
AS
BEGIN
    INSERT INTO kungfu_disciple (id, name, specialty, fear)
    VALUES (99999, 'testie', 'test things', 'agile');
END;
