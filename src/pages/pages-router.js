'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const pagesRouter = express.Router();

pagesRouter
  .route('/:page_id')
  .all(requireAuth)
  .get( (req, res, next) => {
    console.log('reached this point');

  });

module.exports = pagesRouter;
