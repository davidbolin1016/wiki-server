'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const pagesRouter = express.Router();
const PagesService = require('./pages-service');

pagesRouter
  .route('/:page_id')
  .all(requireAuth)
  .get( (req, res, next) => {
    PagesService.getPage(req.app.get('db'), req.params.page_id)
      .then(page => {
        return res.status(200).json(page);
      });
  });

module.exports = pagesRouter;
