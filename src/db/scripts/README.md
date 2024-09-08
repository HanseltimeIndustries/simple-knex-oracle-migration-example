# Oracle SQL Scripts

This is VERY IMPORTANT to understand in contrast to either migrations or static_data_objects
(where you could also create stored procedures):

    If you are emulating an AWS RDS oracle database, much of the power (foot guns) of oracledb
    are restricted from you.  Because of this, you could end up creating lots of procedures on
    your local machine that fail to compile when deployed to RDS.  Not only that, but the 
    rdsadmin.* package cannot be compiled due to the compilation user not having the correct
    permissions.  This leads us to the current folder, where we can keep anonymous sql blocks
    and then call them under the user (circumventing compilation issues in rds).


## Scripts

All scripts here are meant to be run via the `yarn execute --env <env> <script name>` command.
Scripts should have comments above them that explain what they need and any variable bindings.
