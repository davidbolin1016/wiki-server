'use strict';
const express = require('express');
const UsersService = require('./users-service');

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
  
            return UsersService.addUser(req.app.get('db'), newUser)
              .then(() => res.status(201).end());      
          });
      })
      .catch(next);
  });


module.exports = usersRouter;