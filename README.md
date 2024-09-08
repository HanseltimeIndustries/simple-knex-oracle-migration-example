# oracledb knex migration pattern

This is a very simple repo that demonstrates the use of knex as a migration manager to an oracledb.

- [oracledb knex migration pattern](#oracledb-knex-migration-pattern)
  - [compose.yaml](#composeyaml)
  - [src/db/knexfile.ts](#srcdbknexfilets)
- [Migrating](#migrating)
  - [First Type of Migration: Transient (State-based)](#first-type-of-migration-transient-state-based)
  - [Second Type of Migration: Non Transient (Static)](#second-type-of-migration-non-transient-static)
    - [Deploy Order](#deploy-order)
    - [Deploy Environments](#deploy-environments)
  - [Bonus: Does it need to be a stored procedure?](#bonus-does-it-need-to-be-a-stored-procedure)
- [Seeding](#seeding)
    - [Creating a new seed](#creating-a-new-seed)
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
<!-- Created with Markdown All In One VSCode Extension -->

## compose.yaml

We provide a simple containerized setup of oracledb for local use and testing of migrations (and whatever other
application logic you may want).

We also provide a simple script to start up `colima` if you are a mac M1/M2 user since oracle does not work well
with m1/m2 chips.  [Running Oracle on Mac M1](https://medium.com/@vhrechukha/how-to-run-oracle-database-on-m1-m2-apple-macs-using-colima-f325adb76102).

```shell
docker compose up oracle-db
```

## src/db/knexfile.ts

This is the main migration config.  It is setup to use the same local database password in the compose.yaml and then is set up with a
fake async connection config retrieval function that goes to SSM parameters and SecretsManager to get the config for migrations.

Note: if you were trying to keep separation of concerns, you would most likely keep a config for migration that gets user info for a 
more admin-like user and then a base config for your application that would retrieve just table read/write permissioned user info.

# Migrating

```shell
yarn migrate --env local
```

You can run migrations by using the migrate script that is provided in the package.  If you look at the script source, you will notice 
that we actually wrap the normal knex functionality into [full-migration.ts](./src/db/bin/full-migration.ts).

## First Type of Migration: Transient (State-based)

The first type of migration is what Knex does really well.  That migration is where every subsequent migration operates off of the 
database's current state.  This is still replayable mind you, but means we HAVE to make sure that everything plays in the same order.

Basically, anything that you can run some sort of alter against, falls into this category.

## Second Type of Migration: Non Transient (Static) 

The second type of migration is for something that we (the user) have decided will never be dependent on the state of the database when altering.
Where this normally shakes out, would be in procedures and functions etc.  Since you can only do `CREATE OR REPLACE` on these resources there
is no sense of these data objects requiring the previous state of the procedure to update.  If you were to update these creates or replaces  in a
Transient migration pattern, you would end up having to copy and paste the last procedure to new migration files.  This can cause a lot of tracking
problems since there is no git-like delta between files for that and can lead to weird race conditions where two developers merge in their respective
overwrites.

The solution to this is to create a static .sql in the [static_data_objects](./src/db/static_data_objects/).  The full-migration script will run
all of these .sql files after having performed all transient migrations.

### Deploy Order

There is one [deploy.ts](./src/db/static_data_objects/) in the static_data_objects folder.  The default behavior of the deployer instance in that
file is that is will run all .sql files *in parallel* if they are not yet deployed when `deployer.finalize()` is called.

If you need a specific order (for instance, you may have a procedure that calls another procedure and uses a custom type), then you can take advantage
of async/await to simply order the files that you want deployed in the file before the `finalize()` call.

```typescript

// Presumably, proc_a uses func_a
await deployer.deploy('functions/func_a.sql')
await deployer.deploy('procedure/proc_a.sql')

// Everything else is deployed in parallel
await deploy.finalize()
```

### Deploy Environments

In the event that your local oracledb can't replicate the environment of your prod db, you may need to create different static objects depending on 
the database.  While this is not ideal because we can't test locally, it is an inevitability when doing something like use AWS Oracle for RDS.

If we were using amazon rds, you would not be able to use many permissions and functions and would also need to use the `rdsadmin` user functions
instead of many of the other oracle solutions online (due to safety considerations on the instance).

You are the maintainer of your own environments in the [knexfile.ts](src/db/knexfile.ts) and you can make use of that with the deployer API.

```typescript
await deployer.deploy('functions/list_directory_files.sql', {
    onlyForEnvs: LOCAL_ENVS,
})
```

Keep in mind that `finalize()` will try to deploy to any environment, so you have to make sure you have a specific deploy statement before that
call.

## Bonus: Does it need to be a stored procedure?

As talked about with RDS already, there are differeneces between a local oracledb and AWS RDS.  One of the biggest differences is the `rdsadmin` user
and packages.  Not only is that package not testable/compilable on your local database host, *it is also not allowed to be compiled into procedures*.

There are some confusing threads about trying to compile procedures that use rdsadmin that basically arrive at the explanation:

  The user can run blocks under their role but procedures are not granted role permissions.

Therefore, if you were to create somme procedure like `delete_all_files_in_directory`, you might find yourself spending tons of time crafting a 
procedure for your local machine, and then find out that you also have to craft it for the RDS machine (since permissions are different), ONLY to
find out that your procedure can't compile because you need to use rdsadmin!

In that case, wouldn't it be better to just keep a set of scripts that you or another developer can call via CLI to run those operations?

If that makes sense to you, we provide the [scripts](./src/db/scripts/) folder where you can put specifically named sql blocks.  This is a lower
burden of QA (mind you), becuase we have no way to automate running these things, but it does allow you to have a space for "SQL that I wish was
a procedure so it would be codified but can't be due to safety restrictions on compiled processes".

# Seeding

Seeds will only ever be run for local environments since they can be destructive and unordered.  As a local developer, you will want to
run your seeds after having run migrations.  Additionally, you will want to create or edit any seeds for new tables or for tables that
have had schema changes.

```shell
yarn seed --env local
```

### Creating a new seed

```shell
yarn new-seed my-table-name
```

This will create a seed file in (src/db/seeds)[src/db/seeds] that you can then update with the appropriate seeding.

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

