#! /bin/bash
export classpath=$(pwd)/lib/mysql-connector-j-9.0.0.jar
liquibase "$@" --classpath=$classpath

# running liquibase
# create DB first (name: "atc_monitoring_system")
## run command in mysql
## create database atc_monitoring_system;

# cd into liquibase folder
# run command "./liquibase.sh update"