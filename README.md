# oracledb knex migration pattern

This is a very simple repo that demonstrates the use of knex as a migration manager to an oracledb.

## compose.yaml

We provide a simple containerized setup of oracledb for local use and testing of migrations (and whatever other
application logic you may want).

We also provide a simple script to start up `colima` if you are a mac M1/M2 user since oracle does not work well
with m1/m2 chips.  [Running Oracle on Mac M1](https://medium.com/@vhrechukha/how-to-run-oracle-database-on-m1-m2-apple-macs-using-colima-f325adb76102).

```shell
docker compose up oracle-db
```

## knexfile.js

This is the main migration config.  It is setup to use the same local database password in the compose.yaml and then is set up with a
fake async connection config retrieval function that goes to SSM parameters and SecretsManager to get the config for migrations.

Note: if you were trying to keep separation of concerns, you would most likely keep a config for migration that gets user info for a 
more admin-like user and then a base config for your application that would retrieve just table read/write permissioned user info.

## Migrating

```shell
yarn migrate --env local
```
