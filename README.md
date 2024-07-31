# oracledb knex migration pattern

This is a very simple repo that demonstrates the use of knex as a migration manager to an oracledb.

- [oracledb knex migration pattern](#oracledb-knex-migration-pattern)
  - [compose.yaml](#composeyaml)
  - [knexfile.js](#knexfilejs)
  - [Migrating](#migrating)
- [Testing](#testing)
  - [Example](#example)
  - [Snapshot testing](#snapshot-testing)
    - [Developer flow](#developer-flow)
      - [For Order Sensitive Operations](#for-order-sensitive-operations)
      - [For Non-Order Sensitive Operations](#for-non-order-sensitive-operations)
      - [Testing Migrations](#testing-migrations)
- [Troubleshooting](#troubleshooting)
  - [Debugging stored procedures](#debugging-stored-procedures)
    - [About host.docker.internal](#about-hostdockerinternal)
  - [Migration Failures](#migration-failures)
<!-- Made with Markdown All In One VSCode Extension -->

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

# Testing

There are certain database objects that are more prone to erroneous migration than others when being gated by just a migration fikle and PR.
Specifically, stored procedures.  

## Example

Let's say that Dev 1 and Dev 2 are both developing a new take on a stored procedure that originally did `SELECT * FROM my_table`.
They actually both want to modify that procedure.  Dev 1 wants to provide a time stamp restriction due to a legacy record problem
and Dev 2 want to provide an id filter since the first 1000 ids are all dummy seed data.

In this case, Dev 1 submits his migration:

```typescript
    await knex.raw(`
    CREATE OR REPLACE PROCEDURE "MyTableProcedure"
    AS
    BEGIN
    SELECT * FROM my_table WHERE date >= "2020-6-6";
    END;
`)
```

And then Dev2 submits their migration later that looks like:

```typescript
    await knex.raw(`
    CREATE OR REPLACE PROCEDURE "MyTableProcedure"
    AS
    BEGIN
    SELECT * FROM my_table WHERE id > 1000;
    END;
`)
```

To both devs and the PR reviewer, each migration looks individually good.  This is because they have no reference to the 
actual stored_procedure that currently exists within the deployed branch.

## Snapshot testing

To solve the above example scenario, we introduce a `db-test-full` yarn script.  This script will provide a clean oracle-db container for
the int-test-oracle-db service the docker compose file.  It will then run the normal `db-test` after ensuring that the supporting 
infrastructure is up.

This test will then run all migrations against the clean oracle database, dump the relevant schemas we worry about in PR review 
(right now just stored_procedures), and do snapshot testing of the stored_procedure source.

If you have written a migration that changes the test source, then you would have to run `yarn db-test-full -u` to update the test's expected
source and commit it.  If you did not commit those changes to the schema, then the tests would fail and show the difference.

### Developer flow

There are two types of migrations that you may want to create:

1. Order Sensitive Operations - these are any SQL commands that you want to run that are being built on the current state of the database.  This is
things like schema altering, adding data at a particular point and indexes for particular columns.

2. Non-order sensitive Operations - This is mainly all compiled data objects like JOBS, PROCEDURES, FUNCTIONS, etc.

#### For Order Sensitive Operations

You will want to make a normal "migration":

```shell
yarn new-migration my_migration_name
```

The above command will put a named migration with boilerplate in [src/db/migrations](src/db/migrations/).
You can then add your respective [knex](https://knexjs.org/) calls in the desired order.

#### For Non-Order Sensitive Operations

TODO: we can either have a bunch of different directories for each data object type or we can do a single folder

If you need to create a STORED_PROCEDURE, you will need to add add a .sql file in [stored_procedures](src/db/stored_procedures/).
Once you have added your STORED_PROCEDURE sql, you then have 2 options.

1. If you need to ensure that this procedure is only created after other dependent procedures are updated,
    then you will want to `explicitly` add an entry in that folder's [deploy.ts](src/db/stored_procedures/deploy.ts).

    ```typescript
    await deployer.deploy('dependent.sql')
    // Add your new function since you want it to be deployed after dependent.sql
    await deployer.deploy('my_new_func.sql')

    // This last call has to be last because it will run any non-explict sql files
    await deployer.finish()
    ```

2. If you are just creating a procedure that doesn't need ordering, you can stop after making the file.  This is because
   ```await deployer.finish()``` will deploy any .sql file in the folder that hasn't already been deployed.


#### Testing Migrations

In general, if you make any new migrations, you will want to run those migrations against a clean database.  If you do not make any migrations,
then you can expect that nothing will have changed with the database and don't need to test this part.

Each time that you make a new migration, part of your immediate testing can be to run the db-tests:

```shell
yarn db-test-full -u
```

If there are any issues with the migration itself, that will get caught when the test calls all migrations, and you can iterate quickly on that.
If you indeed have changed data objects that we snapshot, you will see updated diffs for the snapshot files and will want to review them to make sure they
don't overwrite anything unexpected.  You will commit those changed snapshot files so that PR reviewer can see it.

# Troubleshooting

## Debugging stored procedures

In order to debug stored_procedures, Oracle needs to be able connect back to an open debugger client that you are running.  This could
be SQL Developer, VsCode Oracle Sql Developer tools, etc.  Because of this need though, we need to setup ACLs for the database so that
it can connect to the correct port.

If you look at the [startup](./dev/oracledb/startup/) folder, you will see that we provide a `debugging.sql` file that will run when the
database is brought up.  The file is setup to allow connection on the `65000` port for debugging for the `SYSTEM` user.  If your database
needs to connect with other users in local devlopment, you will need to update that script to pre-allow them.

Once you have started your local database, you will then need to start up a program that will try and run debugging.  You will want to make sure that
the program is only using the same port `65000`.

### About host.docker.internal

At least in the Oracle PL/SQL Developer tools for VsCode, there is a bug where the "Run Debug" function does not allow us to say use `host.docker.internal`.
This is critical for us to use since you're using your local IDE and debugging tool but the oracle db is running in a container and
needs to reach back out to your local machine (localhost resolves to the container).

If your debug tools do not allow you to do this, never fear!

1. First file a bug with oracle.  It's pretty clear they're not fully up to speed on docker development yet.
2. You can open an sql file in your debug tool of choice and use the example in [example-debug-call.sql](dev/oracledb/example-debug-call.sql)

Under the surface, your debugger clients are wrapping calls to the oracle database in the same `TCP_CONNECT` calls as well.

**IMPORANT** - If you want to use break points in stored_procedures, remember that you will need to compile it for debug using your pl/sql development tool.

## Migration Failures

There may come a time, while migrating (especially locally), where your knex migration fails mid-migration
in an abrupt way.

In that case, you will find that a knex lock was held
via the message:

```shell
MigrationLocked: Migration table is already locked
```

When you see this, you will need to unlock the migration table (assuming
that this is really not another migration running), by using:

```shell
yarn knex migrate:unlock --env local
```

