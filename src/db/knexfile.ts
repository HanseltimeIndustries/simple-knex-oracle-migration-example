import type { Knex } from "knex";
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { join } from "path";

export enum Envs {
  Local = 'local',
  TestDb = 'dbTest',
  Develop = 'develop',
  Production = 'production',
}

const commonConfig = {
  client: 'oracledb',
  migrations: {
    tableName: 'knex_migrations',
    directory: join(__dirname, 'migrations'),
    // This is an unfortunate design choice, they wrap all migrationns in one transaction for 0 work avoidance
    disableTransactions: true
  },
  // Local seed files
  seeds: {
    directory: join(__dirname, 'seeds'),
    recursive: true
  }
};

const secretsManager = new SecretsManager();
const ssm = new SSM();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config: { [key in Envs]: Knex.Config } = {
  local: {
    ...commonConfig,
    connection: {
      host: '127.0.0.1',
      port: 8888,
      user: 'SYSTEM',
      password: 'testPword',
      database: 'FREEPDB1',
    },
  },
  dbTest: {
    ...commonConfig,
    connection: {
      host: '127.0.0.1',
      port: 8889,
      user: 'SYSTEM',
      password: 'testPword',
      database: 'FREEPDB1',
    },
  },
  develop: {
    ...commonConfig,
    connection: async () => {
      // You can use client-secretsmanager to get the secret outright
      // Or you could return information that's been put on the 
      const connInfoResp = await ssm.getParameter({
        Name: '/dev/db/connInfo'
      });
      if (!connInfoResp.Parameter?.Value) {
        throw new Error(`Could not get /dev/db/connInfo parameter`)
      }
      const connInfo = JSON.parse(connInfoResp.Parameter.Value);
      const migrateUserInfoResp = await secretsManager.getSecretValue({
        SecretId: '/dev/db/migrationUser'
      });
      if (!migrateUserInfoResp.SecretString) {
        throw new Error(`Could not get /dev/db/migrationUser secret`)
      }
      const migrateUserInfo = JSON.parse(migrateUserInfoResp.SecretString);
      // TODO: we can apply an expiration time here too to get some auto-retry on secret rotation
      return {
        host: connInfo.host,
        port: connInfo.port,
        database: connInfo.database,
        user: migrateUserInfo.user,
        password: migrateUserInfo.password
      };
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    connection: async () => {
      // You can use client-secretsmanager to get the secret outright
      // Or you could return information that's been put on the 
      const connInfoResp = await ssm.getParameter({
        Name: '/dev/db/connInfo'
      });
      if (!connInfoResp.Parameter?.Value) {
        throw new Error(`Could not get /dev/db/connInfo parameter`)
      }
      const connInfo = JSON.parse(connInfoResp.Parameter.Value)
      const migrateUserInfoResp = await secretsManager.getSecretValue({
        SecretId: '/dev/db/migrationUser'
      });
      if (!migrateUserInfoResp.SecretString) {
        throw new Error(`Could not get /dev/db/migrationUser secret`)
      }
      const migrateUserInfo = JSON.parse(migrateUserInfoResp.SecretString);
      // TODO: we can apply an expiration time here too to get some auto-retry on secret rotation
      return {
        host: connInfo.host,
        port: connInfo.port,
        database: connInfo.database,
        user: migrateUserInfo.user,
        password: migrateUserInfo.password
      };
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};

export default config;
