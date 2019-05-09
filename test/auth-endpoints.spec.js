'use strict';
/* global supertest */
const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function() {
  let db;

  const { testUsers, testPages, testHomePages } = helpers.makeArrays();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers, testPages, testHomePages);
    });
    
    const requiredFields = ['username', 'password'];
    
    requiredFields.forEach(field => {
      const loginAttemptedBody = {
        username: testUser.username,
        password: testUser.password
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptedBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptedBody)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    it('responds 400 \'invalid username or password\' when bad username', () => {
      const userInvalidUser = { username: 'fakeuser', password: 'fakepass' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, { error: 'Incorrect username or password' });
    });

    it('responds 400 \'invalid username or password\' when bad password', () => {
      const userInvalidPass = { username: testUser.username, password: 'incorrect' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPass)
        .expect(400, { error: 'Incorrect username or password' });
    });

    it('responds 200 with JWT auth token and home page when valid credentials', () => {
      const userValidCreds = {
        username: testUser.username,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id }, // payload
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
          homepage: 1
        });
    });

  });});