'use strict';
const regex = /(?=.*[a-zA-Z])(?=.*[0-9])[\S]+/;
const bcrypt = require('bcryptjs');

const UsersService = {
  validatePassword(password) {
    if (!password) {
      return 'Missing \'password\' in request body';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    if (password.length > 71) {
      return 'Password must be less than 72 characters';
    }

    if (password.startsWith(' ')) {
      return 'Password must not start or end with a space';
    }

    if (password.endsWith(' ')) {
      return 'Password must not start or end with a space';
    }

    if (!regex.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
  },

  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  addUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },
};
module.exports = UsersService;