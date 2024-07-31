# If you change this version, make sure to change caching in the github actions
FROM container-registry.oracle.com/database/free:latest

COPY ./healthcheck.sh ./
# setup scripts to run on db initialization
COPY ./startup /opt/oracle/scripts/startup