'use strict';
/* global supertest, expect */

const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Pages Endpoints', function() {
  let db;
  const { testUsers, testPages, testHomePages } = helpers.makeArrays();
  
  const newPage = {
    page_name: 'Stuff',
    page_content: 'This is my proposed new content'
  };

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

  describe('GET /api/pages', () => {
    it('responds with 200 and an array of pages belonging to current user', () => {
      return supertest(app)
        .get('/api/pages')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, [
          {
            'date_created': testPages[0].date_created,
            'date_modified': testPages[0].date_modified,
            'id': testPages[0].id,
            'page_name': testPages[0].page_name
          },
          {
            'date_created': testPages[1].date_created,
            'date_modified': testPages[1].date_modified,
            'id': testPages[1].id,
            'page_name': testPages[1].page_name
          }
        ]);
    });
    it('limits results based on search term given as query', () => {
      return supertest(app)
        .get('/api/pages?searchTerm=personal')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, [
          {
            'date_created': testPages[0].date_created,
            'date_modified': testPages[0].date_modified,
            'id': testPages[0].id,
            'page_name': testPages[0].page_name
          }
        ]);
    });
  });

  describe('POST /api/pages', () => {
    it('responds with 400 bad request if no page title is specified', () => {
      return supertest(app)
        .post('/api/pages')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({
          page_content: newPage.page_content
        });
    });

    it('responds with 201 created and new page id if request is well formed', () => {
      return supertest(app)
        .post('/api/pages')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPage)
        .expect(201)
        .expect(res => {
          expect(res.body.page_id).not.to.be.undefined;
        });
    });

    it('adds internal link to a new page mentioning title of earlier page', () => {
      return supertest(app)
        .post('/api/pages')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({
          page_name: 'Mentioning an earlier page',
          page_content: 'This will link to the Personal Home Page.'
        })
        .expect(201)
        .expect(res => {
          return db.from('pages').where( {id: res.body.page_id} )
            .then(res => {
              expect(res[0].page_content).to.equal('This will link to the <IntLink 1>Personal Home Page<IntLink />.');
            });
    
        });
    });
  });
  describe('GET /api/pages/:page_id', () => {
    it('returns 200 and the page requested if it belongs to the user', () => {
      return supertest(app)
        .get('/api/pages/1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect(res => {
          expect(res.body).to.eql([{
            id: 1,
            user_id: testUsers[0].id,
            page_name: 'Personal Home Page',
            page_content: 'Create your personal home page here.',
            date_created: testUsers[0].date_created,
            date_modified: testUsers[0].date_created
          }]); 
        });
    });
    it('returns 404 not found if the page does not exist', () => {
      return supertest(app)
        .get('/api/pages/5')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(404);
    });

    it('returns 400 bad request if id is not a number', () => {
      return supertest(app)
        .get('/api/pages/aaa')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'Page id must be a number'});
    });
  });

  describe('DELETE /api/pages/:page_id', () => {
    it('returns 204 and no content if successful', () => {
      return supertest(app)
        .delete('/api/pages/2')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(204);
    });

    it('returns 404 if page does not exist', () => {
      return supertest(app)
        .delete('/api/pages/5')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(404);
    });

  });

  describe('PATCH /api/pages/:page_id', () => {
    it('updates a page as requested', () => {
      return supertest(app)
        .patch('/api/pages/1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({
          page_content: 'Updated Page Content'
        })
        .expect(204)
        .expect(() => {
          return db.from('pages').where({id: 1})
            .then(res => {
              expect(res[0].page_content).to.equal('Updated Page Content');
            });
        });
    });
    it('returns 404 if page does not exist', () => {
      return supertest(app)
        .patch('/api/pages/5')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({
          page_content: 'Updated Page Content'
        })
        .expect(404);
    });
  });
});