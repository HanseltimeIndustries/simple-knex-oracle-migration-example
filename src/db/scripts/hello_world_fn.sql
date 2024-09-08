-- Simple Parameterized tester script that doesn't require other dependencies
-- Allows you to get used to using bindings
-- Params:
--   person - name of the person to greet
BEGIN
    dbms_output.put_line('Hello, Oracle!');
    dbms_output.put_line('Hello, World!');
    dbms_output.put_line('Hello, ' || :person || '!');
END;
