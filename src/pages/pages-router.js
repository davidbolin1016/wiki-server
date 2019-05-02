'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const pagesRouter = express.Router();
const jsonBodyParser = express.json();
const PagesService = require('./pages-service');
const LinkService = require('./pages-links');

pagesRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const newPage = req.body;
    newPage.user_id = req.user.id;

    if (!newPage.page_name) {
      return res.status(400).json({
        error: 'Page title is required'
      });
    } 

    // check content for other page titles in order to add links
    PagesService.getPageList(req.app.get('db'), req.user.id)
      .then(list => {
        newPage.page_content = LinkService.createMultipleLinks(newPage.page_content, list);
        // create new page
        PagesService.addPage(req.app.get('db'), newPage)
          .then((page) => {
            return res.status(201).json({page_id: page.id});
          });
      });
  
    // check for title in other page content in order to add links
    // PagesService.getPageList(req.app.get('db'), req.user.id)
    //   .then(list => {
    //     list.forEach(otherPage => {
    //       if (page.id !== otherPage.id) {
    //         PagesService.getPage(req.app.get('db'), otherPage.id)
    //           .then(pageWithContent => {
    //             const updatedContent = LinkService.createLinks(pageWithContent.page_content, page);
    //             if (updatedContent !== pageWithContent.page_content) {
    //               PagesService.updatePage(req.app.get('db'), otherPage.id, {page_content: updatedContent})
    //                 .then(
               
               
                    
            
  })
  .get((req, res, next) => {
    PagesService.getPageList(req.app.get('db'), req.user.id)
      .then(list => {
        return res.status(200).json(list);
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
  })
  .delete((req, res, next) => {
    PagesService.deletePage(req.app.get('db'), req.params.page_id, req.app.body)
      .then(() => {
        return res.status(204).end();
      });
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const {page_name, page_content} = req.body;
    const newObj = {};

    if (page_name) {
      newObj.page_name = page_name;
    } 

    if (page_content) {
      newObj.page_content = page_content;
    }

    newObj.date_modified = new Date();

    PagesService.updatePage(req.app.get('db'), req.params.page_id, newObj)
      .then(() => {
        return res.status(204).end();
      });
  });
  

module.exports = pagesRouter;
