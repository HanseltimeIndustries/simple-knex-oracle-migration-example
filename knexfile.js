// Update with your config settings.

const commonConfig = {
  client: 'oracledb',
  migrations: {
    tableName: 'knex_migrations'
  }
};

const { SecretsManager } = require('@aws-sdk/client-secrets-manager');
const { SSM } = require ('@aws-sdk/client-ssm');

const secretsManager = new SecretsManager();
const ssm = new SSM();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

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

  develop: {
    ...commonConfig,
    connection: async () => {
      // You can use client-secretsmanager to get the secret outright
      // Or you could return information that's been put on the 
      const connInfoResp = await ssm.getParameter({
        Name: '/dev/db/connInfo'
      });
      const connInfo = JSON.parse(connInfoResp.Parameter.Value);
      const migrateUserInfoResp = await secretsManager.getSecretValue({
        Name: '/dev/db/migrationUser'
      });
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
      const connInfo = JSON.parse(connInfoResp.Parameter.Value)
      const migrateUserInfoResp = await secretsManager.getSecretValue({
        Name: '/dev/db/migrationUser'
      });
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
