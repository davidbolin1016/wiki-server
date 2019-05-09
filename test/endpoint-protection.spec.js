'use strict';
/* global supertest */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', () => {
  let db;

  const { testUsers, testPages, testHomePages } = helpers.makeArrays();

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

  beforeEach('insert users', () => {
    return helpers.seedUsers(db, testUsers, testPages, testHomePages);
  });

  const protectEndpoints = [
    {
      name: 'GET /api/pages/',
      path: '/api/pages'
    },
    {
      name: 'GET /api/pages/:page_id',
      path: '/api/pages/1/'
    },
    {
      name: 'GET /api/users',
      path: '/api/users'
    }
  ];

  protectEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds with 401 \'Missing bearer token\' when no bearer token', () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('respond 401 \'Unauthorized request\' when invalid JWT secret', () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request'});
      });

      it('responds 401 \'Unauthorized request\' when invalid sub in payload', () => {
        const invalidUser = { username: 'fakeuser', id: 1 };
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    
    });
  });
  describe('GET /api/pages/:page_id', () => {
    it('responds 401 \'Unauthorized request\' when page belongs to another user', () => {
      return supertest(app)
        .get('/api/pages/3')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(401, { error: 'Unauthorized request' });
    });
  });
});
