# Runscape API

A simple RESTful API written in NodeJS that allows the creation of account and handling of physical activities

## Dev tools

- Trello: https://trello.com/invite/b/7nNzJwwd/e39a421c13827880e838948f4e594cc9/tpiphilibert
- Postman (Tests): https://app.getpostman.com/join-team?invite_code=8d0fd04c854366e016582dbe04f5baf7

# Installation guide

Node modules are packaged inside the application

## prerequisites

- Have mysql installed
- Have nodejs installed
- Have port 80 TCP open

## Guide

- Run the script \Documentation\database\scriptCreation.sql
- Run the script \Documentation\database\SwitzerlandPlaces.sql
- Create a file under \Code\api\src\config named db.js
    - Content of this file should be : module.exports = {
    -    "user": "database_user",
    -    "password": "database_user_password",
    -    "database": "runscape",
    -    "timezone": "UCT+0"
    - };
- Run the application with node : node app.js (\Code) or nodemon : nodemon app.js

/!\ You might need to remove the STRICT_TRANST_TABLE directive from the sql_mode

You can now create new users using the /api/user endpoint



