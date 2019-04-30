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
  }
};

module.exports = PagesService;