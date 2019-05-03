'use strict';

const PagesService = {
  addPage(db, newPage) {
    return db
      .insert(newPage)
      .into('pages')
      .returning('*')
      .then(([page]) => page);
  },
  setHomePage(db, user_id, home_page_id) {
    return db
      .insert({
        user_id, home_page_id
      })
      .into('home_pages')
      .returning('*')
      .then(([entry]) => entry);
  },
  checkOwner(db, id) {
    return db
      .select('user_id')
      .from('pages')
      .where({ id });
  },
  findHomePage(db, user_id) {
    return db
      .select('home_page_id')
      .from('home_pages')
      .where({ user_id });
  },
  getPage(db, id) {
    return db
      .from('pages')
      .where( {id: id} );
  },
  getPageList(db, user_id) {
    return db
      .select('id', 'page_name', 'date_created', 'date_modified')
      .from('pages')
      .where( {user_id} );
  },
  deletePage(db, id) {
    return db
      .from('pages')
      .where( {id} )
      .del();
  },
  updatePage(db, id, updatedPage) {
    return db
      .from('pages')
      .where({id})
      .update(updatedPage);
  },
  getFullPages(db, user_id) {
    return db
      .select('*')
      .from('pages')
      .where( {user_id} );
  },
  getSearchedList(db, user_id, searchTerm) {
    return db
      .select('id', 'page_name', 'date_created', 'date_modified')
      .from('pages')
      .where( {user_id} )
      .where('page_content', 'ilike', `%${searchTerm}%`); 
  }

};

module.exports = PagesService;