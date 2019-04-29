'use strict';
const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, username } = req.body;
    console.log(password, username);
    return res.status(200).end();
  });


module.exports = usersRouter;