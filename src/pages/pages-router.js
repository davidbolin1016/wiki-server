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
            // check for new title in previous page content
            PagesService.getFullPages(req.app.get('db'), req.user.id)
              .then(list => {
                const contentUpdates = list.map(fullPage => {
                  if (fullPage.id === page.id) {
                    return page.page_content;
                  }
                  const newContent = LinkService.createLinks(fullPage.page_content, page);

                  if (newContent === fullPage.page_content) {
                    return fullPage.page_content;
                  }

                  return PagesService.updatePage(req.app.get('db'), fullPage.id, {page_content: newContent});
                });
                Promise.all(contentUpdates)
                  .then(() => {
                    return res.status(201).json({page_id: page.id});
                  });
              });
          });
      })
      .catch(next);          
  })
  .get((req, res, next) => {
    if (!req.query.searchTerm) {
      PagesService.getPageList(req.app.get('db'), req.user.id)
        .then(list => {
          return res.status(200).json(list);
        })
        .catch(next);
    } else {
      PagesService.getSearchedList(req.app.get('db'), req.user.id, req.query.searchTerm)
        .then(list => {
          return res.status(200).json(list);
        })
        .catch(next);
    }
  });

pagesRouter
  .route('/:page_id')
  .all(requireAuth)
  .get( (req, res, next) => {
    PagesService.getPage(req.app.get('db'), req.params.page_id)
      .then(page => {
        return res.status(200).json(page);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    PagesService.deletePage(req.app.get('db'), req.params.page_id, req.app.body)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const {page_name, page_content} = req.body;
    const newObj = {
      id: req.params.page_id
    };

    if (page_name) {
      newObj.page_name = page_name;
    } 

    if (page_content) {
      newObj.page_content = page_content;
    }

    newObj.date_modified = new Date();

    PagesService.getPageList(req.app.get('db'), req.user.id)
      .then(list => {
        newObj.page_content = LinkService.createMultipleLinks(newObj.page_content, list);
        
        PagesService.updatePage(req.app.get('db'), req.params.page_id, newObj)
          .then(() => {
            PagesService.getFullPages(req.app.get('db'), req.user.id)
              .then(list => {
                const contentUpdates = list.map(fullPage => {
                  if (fullPage.id === req.params.page_id) {
                    return newObj.page_content;
                  }
                  const newContent = LinkService.createLinks(fullPage.page_content, newObj);

                  if (newContent === fullPage.page_content) {
                    return fullPage.page_content;
                  }

                  return PagesService.updatePage(req.app.get('db'), fullPage.id, {page_content: newContent});
                });
                Promise.all(contentUpdates)
                  .then(() => {
                    return res.status(204).end();
                  });
              });
          });
      })
      .catch(next);
  });
  

module.exports = pagesRouter;
