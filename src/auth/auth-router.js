'use strict';
const express = require('express');
const AuthService = require('./auth-service');
const requireAuth = require('../middleware/jwt-auth').requireAuth;
const PagesService = require('../pages/pages-service');
const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;
    const loginUser = { username, password };
  
    for ( const [key, value] of Object.entries(loginUser)) {
      // eslint-disable-next-line eqeqeq
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    }

    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.username
    )
      .then(dbUser => {
        if(!dbUser) {
          return res.status(400).json({
            error: 'Incorrect username or password'
          });
        }
        return AuthService.comparePasswords(loginUser.password, dbUser.hashed_password)
          .then(compareMatch => {
            if (!compareMatch)
              return res.status(400).json({
                error: 'Incorrect username or password',
              });

            const sub = dbUser.username;
            const payload = { user_id: dbUser.id };
            PagesService.findHomePage(req.app.get('db'), dbUser.id)
              .then(homepage => {
                return res.send({
                  authToken: AuthService.createJwt(sub, payload),
                  homepage: homepage[0].home_page_id
                });
              });
           
          }); 
      })
      .catch(next);
  });


const cb = function(req, res) {
  const sub = req.user.username;
  const payload = { user_id: req.user.id };
  res.send({
    authToken: AuthService.createJwt(sub, payload)
  });
};

authRouter
  .post('/refresh', requireAuth, cb);

module.exports = authRouter;