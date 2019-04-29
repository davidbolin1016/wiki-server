'use strict';
const express = require('express');
const UsersService = require('./users-service');
const PagesService = require('../pages/pages-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, username } = req.body;
    
    const passwordError = UsersService.validatePassword(password);

    if (passwordError) {
      return res.status(400).json({error: passwordError});
    }

    UsersService.hasUserWithUserName(req.app.get('db'), username)
      .then(hasUserWithUserName => {
        if (hasUserWithUserName) {
          return res.status(400).json({error: 'Username already taken'});
        }

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              hashed_password: hashedPassword,
              date_created: 'now()'
            };

            const newPage = {
              page_name: 'Personal Home Page',
              page_content: 'Create your personal home page here.',
              date_created: 'now()'
            };
  
            return UsersService.addUser(req.app.get('db'), newUser)
              .then((user) => {
                newPage.user_id = user.id;
                return PagesService.addPage(req.app.get('db'), newPage)
                  .then(page => {
                    PagesService.setHomePage(req.app.get('db'), newPage.user_id, page.id)
                      .then(() => {
                        return res.status(201).json({
                          username: username,
                          homepage: page.id
                        });
                      });
                  });      
              });    
          });
      })
      .catch(next);
  });


module.exports = usersRouter;