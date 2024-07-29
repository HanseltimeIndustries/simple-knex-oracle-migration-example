--- Per https://container-registry.oracle.com/ords/f?p=113:4:108168742733899:::4:P4_REPOSITORY,AI_REPOSITORY,AI_REPOSITORY_NAME,P4_REPOSITORY_NAME,P4_EULA_ID,P4_BUSINESS_AREA_ID:1863,1863,Oracle%20Database%20Free,Oracle%20Database%20Free,1,0&cs=31sA0QUYjtv0bYuCSFBgbs5naF1FHOE9_eMmj4XpIyOE9RL_BR7jVr6LwzpiRH7EUsr4lx3GqI8XFXtSfJGcgKg
--- This is run as SYSDBA and adds ACLS for the local db to do debugging connections out
--- We use all host names because this is a test DB and running in an isolated docker container
--- IMPORTANT - right now this just grants SYSTEM for demonstration purposes, but you will want ot update other users

-- Grant debug privileges to user
GRANT DEBUG CONNECT SESSION TO SYSTEM;
GRANT DEBUG ANY PROCEDURE TO SYSTEM;

-- Set up ACL to allow the database to connect back to Visual Studio Code
-- Hostname/IP address and ports are those used for debugging on local VS Code machine
-- This needs to be done once for the machine.
BEGIN
  DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
  HOST => '*',
  LOWER_PORT => 65000,
  UPPER_PORT => 65000,
  ACE => XS$ACE_TYPE(PRIVILEGE_LIST => XS$NAME_LIST('jdwp'),
    PRINCIPAL_NAME =>'SYSTEM',
    PRINCIPAL_TYPE => XS_ACL.PTYPE_DB));
END;
/