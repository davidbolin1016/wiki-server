'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const pagesRouter = require('./pages/pages-router');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/pages', pagesRouter);

// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    // eslint-disable-next-line no-console
    console.error(error);
    response = {message: error.message, error};
  }

  res.status(500).json(response);
});

module.exports = app;