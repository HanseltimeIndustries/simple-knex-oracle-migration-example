import { parseDataObjectSql } from "./parseDataObjectSql"

describe('parseDataObjectSql', () => {
    it.each([
        [
            'CREATE OR REPLACE\n PROCEDURE TEST_PROCEDURE1 AS BEGIN SOMETHING END',
            'PROCEDURE',
            'TEST_PROCEDURE1'
        ],
        [
            '  CREATE\n PROCEDURE TEST_PROCEDURE2 AS BEGIN SOMETHING END',
            'PROCEDURE',
            'TEST_PROCEDURE2'
        ],
        [
            'CREATE OR REPLACE\n FUNCTION TEST_FUNC1 AS BEGIN SOMETHING END',
            'FUNCTION',
            'TEST_FUNC1'
        ],
        [
            '  CREATE\n FUNCTION TEST_FUNC2 AS BEGIN SOMETHING END',
            'FUNCTION',
            'TEST_FUNC2'
        ],
        [
            '  CREATE\n INDEX IDX AS BEGIN SOMETHING END',
            'INDEX',
            'IDX'
        ],
        [
            'CREATE OR REPLACE\n JOB TEST_JOB1 AS BEGIN SOMETHING END',
            'JOB',
            'TEST_JOB1'
        ],
        [
            '  CREATE\n JOB TEST_JOB2 AS BEGIN SOMETHING END',
            'JOB',
            'TEST_JOB2'
        ],
        [
            'CREATE OR REPLACE\n PACKAGE\n TEST_PKG1 AS BEGIN SOMETHING END',
            'PACKAGE',
            'TEST_PKG1'
        ],
        [
            '  CREATE\n PACKAGE TEST_PKG2 AS BEGIN SOMETHING END',
            'PACKAGE',
            'TEST_PKG2'
        ],
    ])('finds the correct values from the sql', (sql, dataType, name) => {
        expect(parseDataObjectSql(sql)).toEqual({
            dataType,
            name,
        })
    })
    it('fails if it cannot find the dataType', () => {
        expect(() => parseDataObjectSql('ALTER TABLE my_table')).toThrow()
    })
    it('fails if it cannot find the nanme', () => {
        expect(() => parseDataObjectSql('CREATE\n\n PROCEDURE')).toThrow()
    })
})