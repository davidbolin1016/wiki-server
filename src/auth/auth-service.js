'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
  getUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  },
  whoamI(db, token) {
    const payload = this.verifyJwt(token);
    return db
      .select('home_page_id')
      .from('home_pages')
      .where({ user_id: payload.user_id })
      .then(result => { return {
        home_page_id: result[0].home_page_id,
        username: payload.sub
      };});
  }
};

module.exports = AuthService;

