'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'testuser1',
      password: 'password1',
      date_created: '2019-05-02T16:28:32.615Z'
    },

    {
      id: 2,
      username: 'testuser2',
      password: 'password2',
      date_created: '2019-05-03T17:28:32.615Z'
    }
  ];
}

function makePagesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      page_name: 'Personal Home Page',
      page_content: 'Create your personal home page here.',
      date_created: users[0].date_created,
      date_modified: users[0].date_modified
    },
    {
      id: 2,
      user_id: users[0].id,
      page_name: 'New Page!',
      page_content: 'I just wrote some stuff',
      date_created: '2019-05-03T16:29:35.615Z'
    },
    {
      id: 3,
      user_id: users[1].id,
      page_name: 'Edited Home Page',
      page_content: 'I created this content',
      date_created: users[1].date_created,
      date_modified: '2019-05-04T17:28:37.615Z'
    }
  ];
}

function makeHomePagesArray(users, pages) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      home_page_id: pages[0].id
    },
    { 
      id: 2,
      user_id: users[1].id,
      home_page_id: pages[2].id
    }
  ];
}

function makeArrays() {
  const testUsers = makeUsersArray();
  const testPages = makePagesArray(testUsers);
  const testHomePages = makeHomePagesArray(testUsers, testPages);

  return {
    testUsers,
    testPages,
    testHomePages
  };
}

function seedUsers(db, users, pages, homePages) {
  
  const preppedUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    hashed_password: bcrypt.hashSync(user.password, 1),
    date_created: user.date_created,
    date_modified: user.date_modified
  }));

  // console.log(preppedUsers, pages, homePages);

  return db.into('users').insert(preppedUsers)
    .then(() => {
      return db.raw(
        'SELECT setval(\'users_id_seq\', ?)',
        [users[users.length - 1].id]
      )
        .then(() => {
          return db.into('pages').insert(pages)
            .then(() => {
              return db.raw(
                'SELECT setval(\'pages_id_seq\', ?)',
                [pages[pages.length - 1].id]
              )
                .then(() => {
                  return db.into('home_pages').insert(homePages);
                })
                .then(() => {
                  return db.raw(
                    'SELECT setval(\'home_pages_id_seq\', ?)',
                    [homePages[homePages.length - 1].id]
                  );
                });
            });
        });
    });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET){
  const token = jwt.sign({user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

function cleanTables(db) {
  return db.raw(
    'TRUNCATE users, pages, home_pages RESTART IDENTITY CASCADE;'
  );
}

module.exports = {
  makeUsersArray,
  makePagesArray,
  makeHomePagesArray,
  makeArrays,
  cleanTables,
  seedUsers,
  makeAuthHeader
};