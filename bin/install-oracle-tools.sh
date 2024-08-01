#!/bin/bash -e

# Install oracle instant client package for use on linux ubuntu/deb distros
# Man oracle is not developer friendly :(

majorVersion=23
minorVersion=4
zipVersion="${majorVersion}.${minorVersion}.0.24.05"

oracleDownloadBase="https://download.oracle.com/otn_software/linux/instantclient/${majorVersion}${minorVersion}0000/"

# zipName="instantclient-basic-linux.x64-${majorVersion}.${minorVersion}.0.24.05.zip"
zipName="instantclient-basiclite-linux.x64-${zipVersion}.zip"
sqlPlusZipName="instantclient-sqlplus-linux.x64-${zipVersion}.zip"
toolsZipName="instantclient-tools-linux.x64-${zipVersion}.zip"

mkdir -p /opt/oracle
wget -P /opt/oracle ${oracleDownloadBase}${zipName}
cd /opt/oracle
unzip "$zipName"

find ./ -type d -name 'instantclient*'
packageName=$(find ./ -type d -name 'instantclient*')
clientDir="/opt/oracle/$packageName"
cd $clientDir

apt-get install libaio1

sh -c "echo $clientDir > \
      /etc/ld.so.conf.d/oracle-instantclient.conf"
ldconfig

echo "Installing SQL Plus..."
# install SQL plus
cd /opt/oracle
wget -P /opt/oracle ${oracleDownloadBase}${sqlPlusZipName}
unzip -o -d /opt/oracle "$sqlPlusZipName"

echo "Installing SQL Utilities..."
# install SQL Data Pump
wget -P /opt/oracle ${oracleDownloadBase}${toolsZipName}
unzip -o -d /opt/oracle "$toolsZipName"


set +e
hasPath=$(cat /etc/bash.bashrc | grep LD_LIBRARY_PATH)
set -e
if [ -z "$hasPath" ]; then
    echo "Adding paths to bash profile..."
    echo "export LD_LIBRARY_PATH=/opt/oracle/$packageName:\$LD_LIBRARY_PATH" >> /etc/bash.bashrc
    echo "export PATH=$clientDir:\$PATH" >> /etc/bash.bashrc
    echo "Please source your ~/.bashrc or start a new shell"
fi
