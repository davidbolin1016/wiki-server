'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const pagesRouter = express.Router();
const jsonBodyParser = express.json();
const PagesService = require('./pages-service');

pagesRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const newPage = req.body;
    newPage.user_id = req.user.id;
    PagesService.addPage(req.app.get('db'), newPage)
      .then((page) => {
        res.status(201).json({page_id: page.id});
      });
  });

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
