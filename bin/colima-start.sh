#!/bin/bash -e

##########################################################################
#
#  This script will start colima if you are on a mac in a configuration 
#  That should work with oracledb.  This is a baseline script that you can tweak
#
###########################################################################

colima start \
    --cpu 2 \
    --memory 4 \
    --arch x86_64 \
    --vz-rosetta \
    --network-address

