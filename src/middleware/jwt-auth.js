'use strict';
const AuthService = require('../auth/auth-service');
const PagesService = require('../pages/pages-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  const desiredPage = req.params.page_id;
  
  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }
  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub
    )
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized request'});
        }

        if (desiredPage) {
          const idVal = Number(desiredPage);
          if (!Number.isInteger(idVal)) {
            return res.status(400).json({ error: 'Page id must be a number'});
          }
          PagesService.checkOwner(req.app.get('db'), desiredPage)
            .then(result => {

              if (!result[0]) {
                return res.status(404).json({ error: 'Page does not exist'});
              }

              if (user.id !== result[0].user_id) {
                return res.status(401).json({ error: 'Unauthorized request'});
              }
            
              req.user = user;
              next();
            });
        } else {
          req.user = user;
          next();
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        next(err);
      });
  } catch(error) {
    res.status(401).json({ error: 'Unauthorized request'});
  }
}

module.exports = {
  requireAuth,
};