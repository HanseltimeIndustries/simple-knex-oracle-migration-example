import { Knex as KnexType } from "knex";
import * as oracledb from 'oracledb'

interface BindVars {
  /** For now, we just support string and number since we have to map oracle types */
  [varName: string]: string | number
}

export async function executeSql(knex: KnexType, sql: string, options: {
  input: BindVars,
}) {
  // Ensure bindings can be run
  const knexBindings = Object.keys(options.input).reduce((bindings, binding) => {
    const val = options.input[binding]
    const t = typeof val

    if (t === 'number') {
      bindings[binding] = {
        dir: oracledb.BIND_IN,
        type: oracledb.NUMBER,
        val,
      }
    } else if (t === 'string') {
      bindings[binding] = {
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
        val,
      }
    } else {
      throw new Error(`Unimplemented type for binding value type of: ${t} (${val})`)
    }

    return bindings
  }, {} as {
    [varName: string]: {
      dir: number
      type: oracledb.DbType
      val: string | number
    }
  })

  await knex.raw(`
        begin 
          dbms_output.enable(null);
        end;
        `)

  const sqlResult = await knex.raw(sql, knexBindings)

  let consoleOut: string = ''
  let ln: string;
  let st: number = 0;
  do {
    [ln, st] = await knex.raw(
      `BEGIN
           dbms_output.get_line(:ln, :st);
         END;`,
      {
        ln: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
        st: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }) as [string, number];
    if (st === 0) {
      consoleOut += ln + '\n'
    }
  } while (st === 0);

  return {
    sqlResult,
    consoleOut,
  }
}