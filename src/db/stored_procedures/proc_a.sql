CREATE OR REPLACE PROCEDURE SelectAllDisciples
AS
    TYPE disc_tab IS TABLE OF kungfu_disciple%ROWTYPE INDEX BY PLS_INTEGER;
    all_disciples disc_tab;
BEGIN
    SELECT * BULK COLLECT INTO all_disciples FROM kungfu_disciple;
END;
