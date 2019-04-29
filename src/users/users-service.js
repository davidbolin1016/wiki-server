'use strict';
const regex = /(?=.*[a-zA-Z])(?=.*[0-9])[\S]+/;

const UsersService = {
  validatePassword(password) {
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
  }
};
module.exports = UsersService;